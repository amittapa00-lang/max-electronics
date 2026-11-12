import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight, Inbox, Printer, Search } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { AdminPage, EmptyState, PageHeader, btn, input } from "@/components/admin/ui";

const PAGE_SIZE = 30;

const TODO_STATUSES = ["WAITING_VERIFY", "PAID", "PREPARING"];
const LABEL_STATUSES = ["PAID", "PREPARING", "SHIPPING"];

const TABS: { key: string; label: string; statuses?: string[] }[] = [
  { key: "todo", label: "ต้องดำเนินการ", statuses: TODO_STATUSES },
  { key: "WAITING_VERIFY", label: "รอตรวจสลิป", statuses: ["WAITING_VERIFY"] },
  { key: "PAID", label: "รอแพ็ก", statuses: ["PAID"] },
  { key: "PREPARING", label: "รอส่ง", statuses: ["PREPARING"] },
  { key: "SHIPPING", label: "กำลังจัดส่ง", statuses: ["SHIPPING"] },
  { key: "COMPLETED", label: "สำเร็จ", statuses: ["COMPLETED"] },
  { key: "PENDING", label: "รอชำระ", statuses: ["PENDING"] },
  { key: "CANCELLED", label: "ยกเลิก", statuses: ["CANCELLED"] },
  { key: "all", label: "ทั้งหมด" },
];

/** สิ่งที่แอดมินต้องทำต่อในแต่ละสถานะ */
const NEXT_TODO: Record<string, string> = {
  WAITING_VERIFY: "ตรวจสลิป",
  PENDING: "รอลูกค้าโอน",
  PAID: "แพ็กสินค้า",
  PREPARING: "ใส่เลขพัสดุ",
  SHIPPING: "รอลูกค้าได้รับ",
};

const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const { status: statusParam, search = "", page: pageParam } = await searchParams;
  const q = search.trim();
  const page = Math.max(1, Number(pageParam) || 1);

  const counts = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const countOf = (statuses?: string[]) =>
    counts.filter((c) => !statuses || statuses.includes(c.status)).reduce((s, c) => s + c._count._all, 0);

  // ค่าเริ่มต้น: ถ้ามีงานค้างให้เปิดแท็บ "ต้องดำเนินการ" ไม่งั้นแสดงทั้งหมด
  const tabKey = TABS.some((t) => t.key === statusParam)
    ? statusParam!
    : countOf(TODO_STATUSES) > 0 && !q
      ? "todo"
      : "all";
  const tab = TABS.find((t) => t.key === tabKey)!;

  const searchId = /^#?\d+$/.test(q) ? Number(q.replace("#", "")) : null;
  const where: Prisma.OrderWhereInput = {
    ...(tab.statuses ? { status: { in: tab.statuses } } : {}),
    ...(q
      ? {
          OR: [
            ...(searchId ? [{ id: searchId }] : []),
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/[-\s]/g, "") } },
            { phone: { contains: q } },
            { trackingNumber: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { select: { quantity: true } } },
      // งานค้างเรียงเก่าสุดก่อน (มาก่อนทำก่อน) / แท็บอื่นเรียงล่าสุดก่อน
      orderBy: { createdAt: tabKey === "todo" || TODO_STATUSES.includes(tabKey) ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ใบปะหน้า: เฉพาะออเดอร์ที่ชำระแล้วและยังไม่จบ ในหน้านี้
  const labelIds = orders.filter((o) => LABEL_STATUSES.includes(o.status)).map((o) => o.id);

  const href = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { status: tabKey, search: q || undefined, ...params };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") sp.set(k, String(v));
    return `/admin/orders?${sp.toString()}`;
  };

  return (
    <AdminPage wide>
      <PageHeader
        title="คำสั่งซื้อ"
        description={`ทั้งหมด ${countOf().toLocaleString()} รายการ · ค้างดำเนินการ ${countOf(TODO_STATUSES)} รายการ`}
        actions={
          labelIds.length > 0 && (
            <Link href={`/admin/orders/labels?ids=${labelIds.join(",")}`} target="_blank" className={btn.secondary}>
              <Printer className="h-4 w-4" /> พิมพ์ใบปะหน้า ({labelIds.length})
            </Link>
          )
        }
      />

      {/* ค้นหา */}
      <form method="GET" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={tabKey} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            defaultValue={q}
            placeholder="ค้นหาเลขคำสั่งซื้อ ชื่อ เบอร์โทร อีเมล หรือเลขพัสดุ"
            className={`${input} pl-9`}
          />
        </div>
        <button className={btn.primary}>ค้นหา</button>
        {q && (
          <Link href={href({ search: undefined, page: undefined })} className={btn.secondary}>
            ล้าง
          </Link>
        )}
      </form>

      {/* แท็บสถานะ */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => {
          const n = countOf(t.statuses);
          const active = t.key === tabKey;
          return (
            <Link
              key={t.key}
              href={href({ status: t.key, page: undefined })}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{n}</span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {orders.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={q ? "ไม่พบคำสั่งซื้อที่ค้นหา" : tabKey === "todo" ? "ไม่มีงานค้าง 🎉" : "ไม่มีคำสั่งซื้อในสถานะนี้"}
            hint={q ? "ลองค้นด้วยเลขคำสั่งซื้อ หรือเบอร์โทร" : undefined}
          />
        ) : (
          <>
            {/* ตาราง (จอใหญ่) */}
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">คำสั่งซื้อ</th>
                  <th className="px-4 py-3">ผู้รับ</th>
                  <th className="px-4 py-3 text-right">ยอดรวม</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">ต้องทำต่อ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const qty = o.items.reduce((s, i) => s + i.quantity, 0);
                  const todo = NEXT_TODO[o.status];
                  return (
                    <tr key={o.id} className="group hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-slate-900 group-hover:text-brand-700">
                          #{o.id}
                        </Link>
                        <p className="text-xs text-slate-500">{dateFmt.format(o.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{o.name}</p>
                        <p className="text-xs text-slate-500">
                          {o.phone} · {qty} ชิ้น
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">฿{o.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                        {o.trackingNumber && <p className="mt-1 font-mono text-xs text-slate-500">{o.trackingNumber}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {todo && TODO_STATUSES.includes(o.status) ? (
                          <span className="font-semibold text-brand-700">{todo}</span>
                        ) : (
                          <span className="text-slate-400">{todo ?? "-"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/orders/${o.id}`} className={`${btn.secondary} h-8 px-3`}>
                          เปิด
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* การ์ด (มือถือ) */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {orders.map((o) => {
                const todo = NEXT_TODO[o.status];
                return (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-slate-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">#{o.id}</span>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {o.name} · {o.phone}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dateFmt.format(o.createdAt)}
                          {todo && TODO_STATUSES.includes(o.status) && (
                            <span className="font-semibold text-brand-700"> · ต้อง{todo}</span>
                          )}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900">฿{o.total.toLocaleString()}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            หน้า {page} / {pages} ({total.toLocaleString()} รายการ)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className={`${btn.secondary} h-9`}>
                <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
              </Link>
            )}
            {page < pages && (
              <Link href={href({ page: page + 1 })} className={`${btn.secondary} h-9`}>
                ถัดไป <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
