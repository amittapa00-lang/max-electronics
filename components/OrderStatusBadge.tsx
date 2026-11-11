export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอชำระเงิน", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  WAITING_VERIFY: { label: "รอตรวจสลิป", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  PAID: { label: "ชำระเงินแล้ว", className: "bg-sky-50 text-sky-800 ring-sky-200" },
  PREPARING: { label: "กำลังเตรียมสินค้า", className: "bg-sky-50 text-sky-800 ring-sky-200" },
  SHIPPING: { label: "กำลังจัดส่ง", className: "bg-indigo-50 text-indigo-800 ring-indigo-200" },
  COMPLETED: { label: "จัดส่งสำเร็จ", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  CANCELLED: { label: "ยกเลิกแล้ว", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function OrderStatusBadge({ status, large }: { status: string; large?: boolean }) {
  const s = ORDER_STATUS[status] ?? { label: status, className: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${s.className} ${
        large ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}
