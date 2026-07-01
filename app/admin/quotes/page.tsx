import { prisma } from "@/lib/prisma";
import Link from "next/link";
import QuoteFilters from "@/components/QuoteFilters";
import type { Prisma } from "@prisma/client";

const statusMap = {
  PENDING: {
    text: "รอดำเนินการ",
    emoji: "🟡",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  PROCESSING: {
    text: "กำลังจัดทำ",
    emoji: "🔵",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  EMAILED: {
    text: "ส่งอีเมลแล้ว",
    emoji: "🟢",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  COMPLETED: {
    text: "ปิดงาน",
    emoji: "✅",
    className: "bg-green-50 text-green-700 ring-green-200",
  },
  CANCELLED: {
    text: "ยกเลิก",
    emoji: "❌",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

function getStatus(status: string) {
  return statusMap[status as keyof typeof statusMap] ?? statusMap.PENDING;
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;

  const where: Prisma.QuoteWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { companyName: { contains: q, mode: "insensitive" } },
            { contactName: { contains: q, mode: "insensitive" } },
            { businessName: { contains: q, mode: "insensitive" } },
            {
              product: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [quotes, allQuotes] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    // ใช้คำนวณตัวเลขสรุปจากข้อมูลทั้งหมด ไม่ผูกกับตัวกรองปัจจุบัน
    prisma.quote.findMany({ select: { status: true } }),
  ]);

  const summary = {
    total: allQuotes.length,
    pending: allQuotes.filter((qt) => qt.status === "PENDING").length,
    processing: allQuotes.filter((qt) => qt.status === "PROCESSING").length,
    completed: allQuotes.filter((qt) => qt.status === "COMPLETED").length,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            งานขาย
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            ใบเสนอราคาทั้งหมด
          </h1>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">ทั้งหมด</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">🟡 รอดำเนินการ</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {summary.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">🔵 กำลังจัดทำ</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {summary.processing}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">✅ ปิดงาน</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {summary.completed}
            </p>
          </div>
        </div>

        {/* ค้นหาและตัวกรอง */}
        <QuoteFilters defaultQuery={q} defaultStatus={status} />

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <span className="text-3xl">🔍</span>
              <p className="font-semibold text-slate-700">
                {q || status
                  ? "ไม่พบใบเสนอราคาที่ตรงกับตัวกรอง"
                  : "ยังไม่มีคำขอใบเสนอราคา"}
              </p>
              <p className="text-sm text-slate-500">
                {q || status
                  ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองดู"
                  : "คำขอจากลูกค้าจะแสดงที่นี่เมื่อมีการส่งเข้ามา"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="whitespace-nowrap px-5 py-3">#</th>
                    <th className="whitespace-nowrap px-5 py-3">วันที่</th>
                    <th className="whitespace-nowrap px-5 py-3">บริษัท</th>
                    <th className="whitespace-nowrap px-5 py-3">
                      ผู้ติดต่อ
                    </th>
                    <th className="whitespace-nowrap px-5 py-3">สินค้า</th>
                    <th className="whitespace-nowrap px-5 py-3 text-right">
                      จำนวน
                    </th>
                    <th className="whitespace-nowrap px-5 py-3">สถานะ</th>
                    <th className="whitespace-nowrap px-5 py-3 text-right">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {quotes.map((quote) => {
                    const status = getStatus(quote.status);

                    return (
                      <tr
                        key={quote.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-slate-500">
                          #{quote.id}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {new Date(quote.createdAt).toLocaleDateString(
                            "th-TH",
                            { day: "numeric", month: "short", year: "2-digit" }
                          )}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-900">
                          {quote.companyName}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {quote.contactName}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {quote.product.name}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">
                          {quote.quantity.toLocaleString()}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}
                          >
                            {status.emoji} {status.text}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            ดูรายละเอียด →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}