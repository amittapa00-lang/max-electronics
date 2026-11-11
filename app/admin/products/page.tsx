import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { ExternalLink, ImageOff, PackageSearch, Pencil, Plus, Search } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";
import { AdminPage, EmptyState, PageHeader, btn, input } from "@/components/admin/ui";

const STOCK_FILTERS: Record<string, { label: string; where: Prisma.ProductWhereInput }> = {
  out: { label: "สินค้าหมด", where: { stock: 0, quotationOnly: false } },
  low: { label: "ใกล้หมด (≤5)", where: { stock: { gt: 0, lte: 5 } } },
  ok: { label: "มีสต็อก", where: { stock: { gt: 5 } } },
  quote: { label: "ขอใบเสนอราคา", where: { quotationOnly: true } },
};

const SORTS: Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }> = {
  new: { label: "เพิ่มล่าสุด", orderBy: { createdAt: "desc" } },
  updated: { label: "แก้ไขล่าสุด", orderBy: { updatedAt: "desc" } },
  name: { label: "ชื่อ ก-ฮ", orderBy: { name: "asc" } },
  "stock-asc": { label: "สต็อกน้อย → มาก", orderBy: { stock: "asc" } },
  "price-desc": { label: "ราคาสูง → ต่ำ", orderBy: { price: "desc" } },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string; sort?: string }>;
}) {
  const { q: qParam = "", category = "", stock = "", sort = "new" } = await searchParams;
  const q = qParam.trim();
  const categoryId = Number(category) || null;

  const categories = await prisma.category.findMany({
    include: { children: { orderBy: [{ order: "asc" }, { name: "asc" }] } },
    where: { parentId: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  // เลือกหมวดหลัก = รวมหมวดย่อยด้วย
  const selectedParent = categories.find((c) => c.id === categoryId);
  const categoryIds = categoryId ? (selectedParent ? [categoryId, ...selectedParent.children.map((c) => c.id)] : [categoryId]) : null;

  const where: Prisma.ProductWhereInput = {
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(STOCK_FILTERS[stock]?.where ?? {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { productCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [products, totalAll, outCount, lowCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, images: { take: 1, select: { imageUrl: true } } },
      orderBy: (SORTS[sort] ?? SORTS.new).orderBy,
    }),
    prisma.product.count(),
    prisma.product.count({ where: STOCK_FILTERS.out.where }),
    prisma.product.count({ where: STOCK_FILTERS.low.where }),
  ]);

  const soldAgg = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) }, order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
  });
  const soldOf = (id: number) => soldAgg.find((s) => s.productId === id)?._sum.quantity ?? 0;

  const filtered = !!(q || category || stock);

  return (
    <AdminPage wide>
      <PageHeader
        title="สินค้า"
        description={
          <>
            ทั้งหมด {totalAll} รายการ ·{" "}
            <Link href="/admin/products?stock=out" className="font-medium text-red-600 hover:underline">
              หมด {outCount}
            </Link>{" "}
            ·{" "}
            <Link href="/admin/products?stock=low" className="font-medium text-amber-600 hover:underline">
              ใกล้หมด {lowCount}
            </Link>
          </>
        }
        actions={
          <Link href="/admin/products/new" className={btn.primary}>
            <Plus className="h-4 w-4" /> เพิ่มสินค้า
          </Link>
        }
      />

      {/* ตัวกรอง */}
      <form method="GET" className="mb-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_170px_170px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="ค้นหาชื่อสินค้า หรือรหัสรุ่น" className={`${input} pl-9`} />
        </div>
        <select name="category" defaultValue={category} className={input} aria-label="หมวดหมู่">
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <optgroup key={c.id} label={c.name}>
              <option value={c.id}>{c.name} (ทั้งหมด)</option>
              {c.children.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  └ {ch.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select name="stock" defaultValue={stock} className={input} aria-label="สต็อก">
          <option value="">ทุกสถานะสต็อก</option>
          {Object.entries(STOCK_FILTERS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className={input} aria-label="เรียงลำดับ">
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className={`${btn.primary} flex-1`}>กรอง</button>
          {filtered && (
            <Link href="/admin/products" className={btn.secondary}>
              ล้าง
            </Link>
          )}
        </div>
      </form>

      {filtered && <p className="mb-3 text-sm text-slate-500">พบ {products.length} รายการ</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {products.length === 0 ? (
          <EmptyState icon={PackageSearch} title="ไม่พบสินค้า" hint={filtered ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เริ่มเพิ่มสินค้าชิ้นแรกได้เลย"} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.map((p) => {
              const img = p.images[0]?.imageUrl;
              const sold = soldOf(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3 px-3 py-3 sm:px-4 hover:bg-slate-50">
                  <Link
                    href={`/admin/products/edit/${p.id}`}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    {img ? (
                      <Image src={img} alt={p.name} fill sizes="56px" className="object-contain p-1" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageOff className="h-5 w-5" />
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/edit/${p.id}`} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-700">
                      {p.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {p.productCode && <span className="font-mono">{p.productCode} · </span>}
                      {p.category.name}
                      {sold > 0 && <> · ขายแล้ว {sold}</>}
                      {p.isRecommended && <span className="ml-1 rounded bg-brand-50 px-1 font-semibold text-brand-700">แนะนำ</span>}
                    </p>
                  </div>

                  <div className="hidden w-28 text-right sm:block">
                    {p.quotationOnly ? (
                      <span className="text-xs font-semibold text-amber-700">ขอใบเสนอราคา</span>
                    ) : (
                      <span className="text-sm font-semibold text-slate-900">฿{p.price.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="w-20 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.stock === 0
                          ? "bg-red-50 text-red-700"
                          : p.stock <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.stock === 0 ? "หมด" : `${p.stock} ชิ้น`}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      title="แก้ไข"
                      aria-label="แก้ไข"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      title="ดูหน้าร้าน"
                      aria-label="ดูหน้าร้าน"
                      className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:inline-flex"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={p.id} name={p.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}
