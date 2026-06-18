"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
}: {
  id: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("ต้องการลบสินค้านี้หรือไม่?");

    if (!ok) return;

    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      ลบ
    </button>
  );
}