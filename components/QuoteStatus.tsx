"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions = [
  { value: "PENDING", label: "🟡 รอดำเนินการ" },
  { value: "PROCESSING", label: "🔵 กำลังจัดทำใบเสนอราคา" },
  { value: "EMAILED", label: "🟢 ส่งอีเมลแล้ว" },
  { value: "COMPLETED", label: "✅ ปิดงาน" },
  { value: "CANCELLED", label: "❌ ยกเลิก" },
];

export default function QuoteStatus({
  id,
  currentStatus,
}: {
  id: number;
  currentStatus: string;
}) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(newStatus: string) {
    const previousStatus = status;

    setStatus(newStatus);
    setIsSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setSaved(true);
      router.refresh();

      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
      alert("อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setStatus(previousStatus);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isSaving}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {isSaving && (
        <span className="text-sm text-slate-500">กำลังบันทึก...</span>
      )}

      {saved && !isSaving && (
        <span className="text-sm font-medium text-emerald-600">
          ✓ บันทึกแล้ว
        </span>
      )}
    </div>
  );
}