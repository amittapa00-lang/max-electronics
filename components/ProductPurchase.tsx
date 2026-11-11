"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { LineIcon, SHOP_LINE_URL } from "./SocialIcons";

export type PurchaseVariant = {
  id: number;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number;
  imageUrl: string | null;
};

/** กล่องราคา + เลือกตัวเลือก + ปุ่มใส่ตะกร้า บนหน้ารายละเอียดสินค้า */
export default function ProductPurchase({
  productId,
  price,
  stock,
  variants,
}: {
  productId: number;
  price: number;
  stock: number;
  variants: PurchaseVariant[];
}) {
  const hasVariants = variants.length > 0;
  // เลือกตัวเลือกแรกที่มีของไว้ก่อน
  const [selectedId, setSelectedId] = useState<number | null>(
    hasVariants ? (variants.find((x) => x.stock > 0) ?? variants[0]).id : null
  );
  const selected = variants.find((x) => x.id === selectedId) ?? null;

  const shownPrice = selected?.price ?? price;
  const shownStock = hasVariants ? (selected?.stock ?? 0) : stock;
  const inStock = shownStock > 0;

  const prices = variants.map((x) => x.price ?? price);
  const priceRange = hasVariants && Math.min(...prices) !== Math.max(...prices);

  function choose(v: PurchaseVariant) {
    setSelectedId(v.id);
    if (v.imageUrl) window.dispatchEvent(new CustomEvent("product:show-image", { detail: v.imageUrl }));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            ราคา{priceRange && selected ? ` (${selected.name})` : ""}
          </p>
          <p className="mt-1 text-4xl font-bold leading-none text-brand-600">
            <span className="mr-1 text-2xl">฿</span>
            {shownPrice.toLocaleString()}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
            inStock ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-slate-400"}`} />
          {inStock ? `มีสินค้า ${shownStock} ชิ้น` : "สินค้าหมด"}
        </span>
      </div>

      {hasVariants && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-800">
            ตัวเลือก: <span className="font-normal text-slate-600">{selected?.name ?? "กรุณาเลือก"}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="ตัวเลือกสินค้า">
            {variants.map((v) => {
              const active = v.id === selectedId;
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(v)}
                  className={`relative inline-flex w-auto items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600"
                      : out
                        ? "border-slate-200 bg-slate-50 text-slate-400"
                        : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                  }`}
                >
                  {v.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.imageUrl} alt="" className="h-7 w-7 rounded object-contain" />
                  )}
                  <span className={out ? "line-through" : ""}>{v.name}</span>
                  {v.price !== null && v.price !== price && <span className="text-xs text-slate-500">฿{v.price.toLocaleString()}</span>}
                  {out && <span className="text-xs">(หมด)</span>}
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          {selected?.sku && (
            <p className="mt-2 text-xs text-slate-500">
              รหัส: <span className="font-mono">{selected.sku}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-5">
        {inStock ? (
          <AddToCartButton key={selectedId ?? "base"} productId={productId} variantId={selected?.id} />
        ) : (
          <div className="space-y-3">
            <button type="button" disabled className="h-13 w-full cursor-not-allowed rounded-lg bg-slate-100 text-base font-semibold text-slate-400">
              {hasVariants ? `"${selected?.name}" หมดชั่วคราว` : "สินค้าหมดชั่วคราว"}
            </button>
            <a
              href={SHOP_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LineIcon className="h-4 w-4 text-[#06C755]" /> สอบถามวันเข้าของ
            </a>
          </div>
        )}
      </div>
    </>
  );
}
