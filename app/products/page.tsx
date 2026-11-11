import { getProducts } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, PackageSearch, X } from "lucide-react";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";

const SORTS = [
  { key: "", label: "ล่าสุด" },
  { key: "price-asc", label: "ราคาต่ำ → สูง" },
  { key: "price-desc", label: "ราคาสูง → ต่ำ" },
  { key: "name", label: "ชื่อ A–Z" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}) {
  const { category, search, sort = "" } = await searchParams;

  const categories =
    (await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    })) ?? [];

  // getProducts() ถูก cache ไว้และคืนสินค้าทั้งหมด จึงกรอง/เรียงที่นี่
  const allProducts = await getProducts();
  const searchLower = search?.trim().toLowerCase();

  const products = allProducts.filter((product) => {
    const matchesCategory =
      !category ||
      product.category?.name === category ||
      product.category?.parent?.name === category;

    const matchesSearch =
      !searchLower ||
      product.name.toLowerCase().includes(searchLower) ||
      product.productCode?.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  // สินค้าขอใบเสนอราคาไว้ท้ายเสมอเมื่อเรียงตามราคา
  const priceKey = (p: (typeof products)[number]) => (p.quotationOnly ? Number.POSITIVE_INFINITY : p.price);
  if (sort === "price-asc") products.sort((a, b) => priceKey(a) - priceKey(b));
  if (sort === "price-desc")
    products.sort((a, b) => (a.quotationOnly ? 1 : b.quotationOnly ? -1 : b.price - a.price));
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "th"));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { category, search, sort, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/products?${s}` : "/products";
  };

  const title = category ?? (search ? "ผลการค้นหา" : "สินค้าทั้งหมด");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-brand-600">สินค้า</Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-slate-800">{category}</span>
          </>
        )}
      </nav>

      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{title}</h1>

      <div className="mt-6 flex flex-col md:flex-row gap-6 lg:gap-8">
        <CategorySidebar categories={categories} currentCategory={category} totalCount={allProducts.length} />

        <div className="flex-1 min-w-0">
          {/* แถบสรุปผล + เรียงลำดับ */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>
                พบ <strong className="text-slate-900">{products.length}</strong> รายการ
              </span>
              {search && (
                <Link
                  href={qs({ search: undefined })}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                >
                  &ldquo;{search}&rdquo; <X className="h-3.5 w-3.5" />
                </Link>
              )}
              {category && (
                <Link
                  href={qs({ category: undefined })}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <span className="truncate max-w-48">{category}</span> <X className="h-3.5 w-3.5 shrink-0" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
              <span className="shrink-0 text-xs text-slate-500 mr-1">เรียง:</span>
              {SORTS.map((s) => (
                <Link
                  key={s.key}
                  href={qs({ sort: s.key || undefined })}
                  scroll={false}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    sort === s.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-base font-semibold text-slate-900">ไม่พบสินค้าที่ค้นหา</p>
              <p className="mt-1 text-sm text-slate-500">ลองพิมพ์รหัสรุ่นสั้นลง หรือเลือกหมวดหมู่อื่น</p>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2">
                <Link href="/products" className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
                  ดูสินค้าทั้งหมด
                </Link>
                <Link href="/contact" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  ให้ทีมงานช่วยหา
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
