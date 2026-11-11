"use client";

import { useState } from "react";
import { Check, Copy, Landmark } from "lucide-react";

const ACCOUNT_NO = "241-8-87380-1";

export default function BankTransferCard({ amount }: { amount: number }) {
  const [copied, setCopied] = useState<"acc" | "amt" | null>(null);

  async function copy(text: string, which: "acc" | "amt") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // บางเบราว์เซอร์ไม่อนุญาต clipboard — ผู้ใช้ยังเลือกข้อความเองได้
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Landmark className="h-4.5 w-4.5 text-brand-600" /> โอนเงิน / สแกนจ่าย
      </h2>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3">
        <div>
          <p className="text-xs text-brand-800/70">ยอดที่ต้องโอน</p>
          <p className="text-2xl font-bold text-brand-700">฿{amount.toLocaleString()}</p>
        </div>
        <CopyButton done={copied === "amt"} onClick={() => copy(String(amount), "amt")} />
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="ธนาคาร" value="กสิกรไทย (KBank)" />
        <Row label="ชื่อบัญชี" value="นาง เบญจมาศ ไชยวุฒิภัทร" />
        <Row label="สาขา" value="โรบินสัน สมุทรปราการ" />
      </dl>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">เลขที่บัญชี</p>
          <p className="font-mono text-lg font-bold tracking-wider text-slate-900">{ACCOUNT_NO}</p>
        </div>
        <CopyButton done={copied === "acc"} onClick={() => copy(ACCOUNT_NO.replace(/-/g, ""), "acc")} />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <p className="mb-2 text-center text-xs text-slate-500">หรือสแกน QR พร้อมเพย์</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/qr-payment-kbank.png"
          alt="QR พร้อมเพย์ — นาง เบญจมาศ ไชยวุฒิภัทร"
          className="mx-auto block w-full max-w-60 rounded-md"
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function CopyButton({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-auto shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
        done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "คัดลอกแล้ว" : "คัดลอก"}
    </button>
  );
}
