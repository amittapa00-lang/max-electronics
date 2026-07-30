"use client";

// components/admin/SalesTrendChart.tsx
// ต้องติดตั้ง recharts ก่อน:  npm install recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Point = { label: string; total: number; count: number };

export default function SalesTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(v: number) => `฿${Number(v).toLocaleString()}`}
          />
          <Tooltip
  formatter={(value, name) =>
    name === "total"
      ? [`฿${Number(value ?? 0).toLocaleString()}`, "ยอดขาย"]
      : [String(value ?? 0), "ออเดอร์"]
  }
            labelStyle={{ color: "#334155" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}