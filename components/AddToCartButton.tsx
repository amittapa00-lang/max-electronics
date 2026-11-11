"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, ShoppingCart, Zap } from "lucide-react";

export default function AddToCartButton({ productId, variantId }: { productId: number; variantId?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"add" | "buy" | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  async function addToCart(mode: "add" | "buy") {
    setLoading(mode);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError(data.error || "เพิ่มสินค้าไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      window.dispatchEvent(new Event("cart:updated"));

      if (mode === "buy") {
        router.push("/cart");
        return;
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 4000);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => addToCart("add")}
          disabled={loading !== null}
          className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg border-2 border-brand-600 bg-white px-5 text-base font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60 transition-colors"
        >
          {loading === "add" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
          หยิบใส่ตะกร้า
        </button>
        <button
          type="button"
          onClick={() => addToCart("buy")}
          disabled={loading !== null}
          className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {loading === "buy" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          ซื้อทันที
        </button>
      </div>

      {added && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-emerald-800">
            <Check className="h-4 w-4" /> เพิ่มลงตะกร้าแล้ว
          </span>
          <Link href="/cart" className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900">
            ไปที่ตะกร้า →
          </Link>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {error}
        </p>
      )}
    </div>
  );
}
