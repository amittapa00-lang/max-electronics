import Link from "next/link";
import Image from "next/image";
import { FileText, ImageOff } from "lucide-react";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  quotationOnly: boolean;
  productCode?: string | null;
  images: { imageUrl: string }[];
  category?: { name: string; parent?: { name: string } | null } | null;
};

export type ProductBadge = "recommended" | "bestseller" | "new";

const BADGES: Record<ProductBadge, { label: string; className: string }> = {
  recommended: { label: "แนะนำ", className: "bg-brand-600 text-white" },
  bestseller: { label: "ขายดี", className: "bg-amber-500 text-white" },
  new: { label: "มาใหม่", className: "bg-slate-900 text-white" },
};

export default function ProductCard({
  product,
  badge,
  priority = false,
}: {
  product: ProductCardData;
  badge?: ProductBadge;
  priority?: boolean;
}) {
  const image = product.images?.[0]?.imageUrl;
  const outOfStock = !product.quotationOnly && product.stock <= 0;
  const lowStock = !product.quotationOnly && product.stock > 0 && product.stock <= 5;
  const categoryLabel = product.category?.name ?? "";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_8px_24px_-8px_rgba(215,25,32,0.25)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white border-b border-slate-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${outOfStock ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-300">
            <ImageOff className="h-10 w-10" />
            <span className="text-xs">ไม่มีรูปสินค้า</span>
          </div>
        )}

        {badge && (
          <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[11px] font-bold ${BADGES[badge].className}`}>
            {BADGES[badge].label}
          </span>
        )}

        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-xs font-semibold text-white">
            สินค้าหมดชั่วคราว
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {categoryLabel && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-brand-600">{categoryLabel}</p>
        )}

        <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] sm:text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        {product.productCode && (
          <p className="truncate font-mono text-[11px] text-slate-400">รุ่น {product.productCode}</p>
        )}

        <div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
          {product.quotationOnly ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
              <FileText className="h-3.5 w-3.5" /> ขอใบเสนอราคา
            </span>
          ) : (
            <p className="text-lg sm:text-xl font-bold leading-none text-brand-600">
              <span className="mr-0.5 text-sm font-semibold">฿</span>
              {product.price.toLocaleString()}
            </p>
          )}

          {!product.quotationOnly && !outOfStock && (
            <span className={`text-[11px] font-medium ${lowStock ? "text-amber-600" : "text-emerald-600"}`}>
              {lowStock ? `เหลือ ${product.stock} ชิ้น` : "พร้อมส่ง"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
