"use client";

import { useRouter } from "next/navigation";

export default function CancelOrderButton({
  orderId,
}: {
  orderId: number;
}) {
  const router = useRouter();

  async function cancelOrder() {
    const confirmCancel =
      confirm(
        "ยืนยันยกเลิกคำสั่งซื้อ?\n\nกรณีชำระเงินแล้วจะไม่คืนเงิน"
      );

    if (!confirmCancel)
      return;

    const res = await fetch(
      `/api/orders/${orderId}/cancel`,
      {
        method: "POST",
      }
    );

    const data =
      await res.json();

    if (res.ok) {
      alert(
        "ยกเลิกคำสั่งซื้อสำเร็จ"
      );

      router.refresh();
    } else {
      alert(
        data.error
      );
    }
  }

  return (
    <button
      onClick={cancelOrder}
      className="
        bg-red-600
        hover:bg-red-700
        text-white
        px-4
        py-2
        rounded-xl
      "
    >
      ยกเลิกคำสั่งซื้อ
    </button>
  );
}