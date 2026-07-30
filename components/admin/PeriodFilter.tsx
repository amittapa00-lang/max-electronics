"use client";

// components/admin/PeriodFilter.tsx
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const PERIODS: { value: string; label: string }[] = [
  { value: "day", label: "รายวัน" },
  { value: "week", label: "รายสัปดาห์" },
  { value: "month", label: "รายเดือน" },
  { value: "year", label: "รายปี" },
];

export default function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const period = searchParams.get("period") || "month";
  const date = searchParams.get("date") || "";

  function updateParams(next: { period?: string; date?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.period) params.set("period", next.period);
    if (next.date !== undefined) {
      if (next.date) params.set("date", next.date);
      else params.delete("date");
    }
    router.push(`${pathname}?${params.toString()}#sales-report`);
  }

  // ค่า input ที่เหมาะกับแต่ละ period
  const now = date ? new Date(date) : new Date();
  const inputType =
    period === "month" ? "month" : period === "year" ? "number" : "date";

  const monthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex bg-slate-100 rounded-xl p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => updateParams({ period: p.value })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p.value
                ? "bg-white shadow text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {inputType === "number" ? (
        <input
          type="number"
          defaultValue={now.getFullYear()}
          onBlur={(e) => updateParams({ date: `${e.target.value}-01-01` })}
          className="border rounded-lg px-3 py-2 text-sm w-28"
          placeholder="ปี พ.ศ./ค.ศ."
        />
      ) : inputType === "month" ? (
        <input
          type="month"
          defaultValue={monthValue}
          onChange={(e) => updateParams({ date: `${e.target.value}-01` })}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      ) : (
        <input
          type="date"
          defaultValue={now.toISOString().slice(0, 10)}
          onChange={(e) => updateParams({ date: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}