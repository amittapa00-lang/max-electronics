"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id, name }: { id: number; name?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`ต้องการลบสินค้า${name ? ` "${name}"` : "นี้"} หรือไม่?\nลบแล้วกู้คืนไม่ได้`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "ลบสินค้าไม่สำเร็จ");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title="ลบสินค้า"
      aria-label="ลบสินค้า"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
