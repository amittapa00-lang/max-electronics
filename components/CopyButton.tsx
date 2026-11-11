"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "คัดลอก" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // เบราว์เซอร์ไม่อนุญาตให้คัดลอก — เงียบไว้
        }
      }}
      className="inline-flex w-auto items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}
