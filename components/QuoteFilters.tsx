"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const statusOptions = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING", label: "🟡 รอดำเนินการ" },
  { value: "PROCESSING", label: "🔵 กำลังจัดทำ" },
  { value: "EMAILED", label: "🟢 ส่งอีเมลแล้ว" },
  { value: "COMPLETED", label: "✅ ปิดงาน" },
  { value: "CANCELLED", label: "❌ ยกเลิก" },
];

export default function QuoteFilters({
  defaultQuery,
  defaultStatus,
}: {
  defaultQuery: string;
  defaultStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(defaultQuery);

  function updateParams(next: { q?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    const q = next.q ?? query;
    const status = next.status ?? defaultStatus;

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  // Debounce the text search so it doesn't push a route on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== defaultQuery) {
        updateParams({ q: query });
      }
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Boolean(defaultQuery || defaultStatus);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาบริษัท ผู้ติดต่อ หรือชื่อสินค้า"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <select
        value={defaultStatus}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-56"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}