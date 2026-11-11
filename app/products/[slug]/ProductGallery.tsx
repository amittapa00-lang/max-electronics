"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

type ProductImage = {
  id: number;
  imageUrl: string;
};

export default function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [index, setIndex] = useState(0);
  const selected = images?.[index]?.imageUrl;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected} alt={productName} className="h-full w-full object-contain p-4 sm:p-6" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-300">
            <ImageOff className="h-14 w-14" />
            <span className="text-sm">ไม่มีรูปสินค้า</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition-colors ${
                i === index ? "border-brand-600" : "border-slate-200 hover:border-slate-400"
              }`}
              aria-label={`ดูรูปที่ ${i + 1}`}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
