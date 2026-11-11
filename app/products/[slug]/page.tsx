import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, ChevronRight, FileText, Phone, ShieldCheck, Truck } from "lucide-react";
import ProductGallery from "./ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import ProductCard from "@/components/ProductCard";
import { LineIcon, SHOP_LINE_URL, SHOP_PHONE, SHOP_PHONE_TEL } from "@/components/SocialIcons";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { id: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
  });

  if (!product) notFound();

  const related = product.categoryId
    ? await prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: product.id } },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { category: true, images: true },
      })
    : [];

  const categoryName = product.category?.name ?? "ไม่ระบุหมวดหมู่";
  const parentName = product.category?.parent?.name;
  const inStock = product.stock > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0" aria-label="breadcrumb">
        <Link href="/" className="shrink-0 hover:text-brand-600">หน้าแรก</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/products" className="shrink-0 hover:text-brand-600">สินค้า</Link>
        {parentName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/products?category=${encodeURIComponent(parentName)}`} className="truncate hover:text-brand-600">{parentName}</Link>
          </>
        )}
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/products?category=${encodeURIComponent(product.category.name)}`} className="truncate hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
        {/* รูปสินค้า */}
        <div className="lg:sticky lg:top-36">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* ข้อมูลสินค้า */}
        <div>
          <Link
            href={`/products?category=${encodeURIComponent(categoryName)}`}
            className="inline-block rounded bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            {categoryName}
          </Link>

          <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-snug text-slate-900">{product.name}</h1>

          {product.productCode && (
            <p className="mt-2 text-sm text-slate-500">
              รหัสรุ่น: <span className="font-mono font-semibold text-slate-800">{product.productCode}</span>
            </p>
          )}

          {/* ราคา + สถานะ */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            {product.quotationOnly ? (
              <>
                <div>
                  <p className="text-sm text-slate-500">ราคา</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">ขอใบเสนอราคา</p>
                  <p className="mt-1 text-sm text-slate-500">ราคาขึ้นกับจำนวนและสเปก ทีมงานจะติดต่อกลับพร้อมใบเสนอราคา</p>
                  {product.variants.length > 0 && (
                    <p className="mt-2 text-sm text-slate-600">
                      มีตัวเลือก: {product.variants.map((v) => v.name).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <Link
                    href={`/quote/${product.id}`}
                    className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    <FileText className="h-5 w-5" /> ขอใบเสนอราคา
                  </Link>
                </div>
              </>
            ) : (
              <ProductPurchase
                productId={product.id}
                price={product.price}
                stock={product.stock}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  sku: v.sku,
                  price: v.price,
                  stock: v.stock,
                  imageUrl: v.imageUrl,
                }))}
              />
            )}
          </div>

          {/* จุดเด่นร้าน */}
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: BadgeCheck, text: "สินค้าแท้ 100%" },
              { icon: Truck, text: "ส่งภายใน 1–3 วันทำการ" },
              { icon: ShieldCheck, text: "รับประกันสินค้า" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <f.icon className="h-4.5 w-4.5 shrink-0 text-brand-600" /> {f.text}
              </li>
            ))}
          </ul>

          {/* สอบถาม */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-slate-900 p-4 text-white">
            <p className="flex-1 text-sm">
              <span className="font-semibold">มีคำถามเรื่องสเปก?</span>
              <span className="text-slate-300"> ทีมงานช่วยเช็กรุ่นที่ใช้แทนกันได้</span>
            </p>
            <div className="flex gap-2">
              <a href={SHOP_PHONE_TEL} className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 text-sm font-semibold hover:bg-white/20">
                <Phone className="h-4 w-4" /> {SHOP_PHONE}
              </a>
              <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-[#06C755] px-3 text-sm font-semibold hover:brightness-95">
                <LineIcon className="h-4 w-4" /> LINE
              </a>
            </div>
          </div>

          {/* รายละเอียด + สเปก */}
          <section className="mt-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-200 px-5 py-3.5 font-semibold text-slate-900">รายละเอียดสินค้า</h2>
            <div className="px-5 py-4">
              {product.description ? (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{product.description}</p>
              ) : (
                <p className="text-sm text-slate-400">ยังไม่มีรายละเอียดเพิ่มเติม</p>
              )}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-200 text-sm">
              <SpecRow label="หมวดหมู่" value={categoryName} />
              <SpecRow label="รหัสรุ่น" value={product.productCode || "-"} mono />
              <SpecRow
                label="สถานะ"
                value={product.quotationOnly ? "สั่งตามใบเสนอราคา" : inStock ? "พร้อมจัดส่ง" : "สินค้าหมด"}
              />
              <SpecRow label="ค่าจัดส่ง" value="เริ่มต้น ฿50 (1–2 ชิ้นแรก) ชิ้นถัดไป +฿50" />
            </dl>
          </section>
        </div>
      </div>

      {/* สินค้าในหมวดเดียวกัน */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
              <span className="h-6 w-1.5 rounded-full bg-brand-600" /> สินค้าในหมวดเดียวกัน
            </h2>
            <Link
              href={`/products?category=${encodeURIComponent(categoryName)}`}
              className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 px-5 py-3 sm:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd className={`min-w-0 font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
