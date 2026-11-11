"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import CheckoutSteps from "./CheckoutSteps";
import { ArrowLeft, ImageOff, Loader2, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck } from "lucide-react";
import { calcShippingFee } from "@/lib/shipping";

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug?: string;
    productCode: string | null;
    price: number;
    stock?: number;
    images: { id: number; imageUrl: string }[];
  };
  variant?: { id: number; name: string; price: number | null; stock: number; imageUrl: string | null } | null;
};

/** ราคาต่อชิ้นจริง (ตัวเลือกอาจมีราคาของตัวเอง) */
const unitPrice = (i: CartItem) => i.variant?.price ?? i.product.price;
const stockOf = (i: CartItem) => (i.variant ? i.variant.stock : i.product.stock);

export default function CartClient({ cartItems }: { cartItems: CartItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  async function mutate(id: number, init: RequestInit) {
    setBusyId(id);
    try {
      await fetch(`/api/cart/${id}`, init);
      window.dispatchEvent(new Event("cart:updated"));
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    mutate(id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
  };

  const deleteItem = (id: number) => {
    if (!confirm("ลบสินค้านี้ออกจากตะกร้า?")) return;
    mutate(id, { method: "DELETE" });
  };

  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cartItems.reduce((s, i) => s + unitPrice(i) * i.quantity, 0);
  const shippingFee = calcShippingFee(totalQty);
  const grandTotal = subtotal + shippingFee;
  const busy = busyId !== null || isPending;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <CheckoutSteps step={1} />

      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ตะกร้าสินค้า</h1>
        {cartItems.length > 0 && <span className="text-sm text-slate-500">{totalQty} ชิ้น</span>}
      </div>

      {cartItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-base font-semibold text-slate-900">ยังไม่มีสินค้าในตะกร้า</p>
          <p className="mt-1 text-sm text-slate-500">เลือกดูอุปกรณ์ไฟฟ้าที่ต้องการ แล้วกด &ldquo;หยิบใส่ตะกร้า&rdquo;</p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* รายการสินค้า */}
          <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {cartItems.map((item) => {
              const img = item.variant?.imageUrl || item.product.images?.[0]?.imageUrl;
              const rowBusy = busyId === item.id;
              const href = item.product.slug ? `/products/${item.product.slug}` : undefined;
              return (
                <div key={item.id} className={`flex gap-3 sm:gap-4 p-4 transition-opacity ${rowBusy ? "opacity-50" : ""}`}>
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={item.product.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {href ? (
                          <Link href={href} className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-slate-900 hover:text-brand-700">
                            {item.product.name}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-slate-900">{item.product.name}</p>
                        )}
                        {item.variant && (
                          <p className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            ตัวเลือก: {item.variant.name}
                          </p>
                        )}
                        {item.product.productCode && (
                          <p className="mt-0.5 font-mono text-xs text-slate-400">รุ่น {item.product.productCode}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        disabled={busy}
                        className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50"
                        aria-label="ลบสินค้า"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="mt-auto pt-3 flex flex-wrap items-end justify-between gap-3">
                      <div className="inline-flex items-center rounded-lg border border-slate-300">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          disabled={busy || item.quantity <= 1}
                          className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                          aria-label="ลดจำนวน"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex h-9 w-10 items-center justify-center border-x border-slate-300 text-sm font-semibold text-slate-900">
                          {rowBusy ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={busy || (stockOf(item) !== undefined && item.quantity >= stockOf(item)!)}
                          className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                          aria-label="เพิ่มจำนวน"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">฿{unitPrice(item).toLocaleString()} / ชิ้น</p>
                        <p className="text-lg font-bold text-slate-900">฿{(unitPrice(item) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* สรุปยอด */}
          <aside className="lg:sticky lg:top-36 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">สรุปคำสั่งซื้อ</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ราคาสินค้า ({totalQty} ชิ้น)</dt>
                <dd className="font-medium text-slate-900">฿{subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ค่าจัดส่ง</dt>
                <dd className="font-medium text-slate-900">฿{shippingFee.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
              <span className="font-semibold text-slate-900">ยอดชำระ</span>
              <span className="text-2xl font-bold text-brand-600">฿{grandTotal.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">รวม VAT แล้ว</p>

            <button
              type="button"
              onClick={() => router.push("/checkout")}
              disabled={busy}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              ดำเนินการสั่งซื้อ
            </button>
            <Link
              href="/products"
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> เลือกซื้อสินค้าต่อ
            </Link>

            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-slate-400" /> 1–2 ชิ้นแรก ฿50 · ชิ้นถัดไป +฿50</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-400" /> รับประกันสินค้าทุกชิ้น</li>
            </ul>
          </aside>
        </div>
      )}
    </main>
  );
}
