import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight, Crown, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { AdminPage, Card, EmptyState, PageHeader, StatCard, btn, input } from "@/components/admin/ui";
import { startOfMonth } from "@/lib/dateRange";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" });

const PROVIDER: Record<string, { label: string; className: string }> = {
  credentials: { label: "อีเมล", className: "bg-slate-100 text-slate-600" },
  google: { label: "Google", className: "bg-sky-50 text-sky-700" },
  line: { label: "LINE", className: "bg-emerald-50 text-emerald-700" },
  facebook: { label: "Facebook", className: "bg-blue-50 text-blue-700" },
};

/** บัญชี LINE/Facebook ที่ไม่มีอีเมลจะเป็น @users.invalid — ไม่แสดงอีเมลปลอม */
const displayEmail = (email: string) => (email.toLowerCase().endsWith(".invalid") ? null : email);

function ProviderBadge({ provider }: { provider: string | null }) {
  const p = PROVIDER[provider ?? "credentials"] ?? { label: provider ?? "-", className: "bg-slate-100 text-slate-600" };
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${p.className}`}>{p.label}</span>;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qParam = "", page: pageParam } = await searchParams;
  const q = qParam.trim();
  const page = Math.max(1, Number(pageParam) || 1);
  const notCancelled = { status: { not: "CANCELLED" } };

  const customerWhere: Prisma.UserWhereInput = {
    role: { not: "ADMIN" },
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { orders: { some: { phone: { contains: q.replace(/[-\s]/g, "") } } } },
          ],
        }
      : {}),
  };

  const [customerCount, adminCount, newThisMonth, buyerGroups, admins, customers, filteredCount, topAgg] = await Promise.all([
    prisma.user.count({ where: { role: { not: "ADMIN" } } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: { not: "ADMIN" }, createdAt: { gte: startOfMonth(new Date()) } } }),
    prisma.order.groupBy({ by: ["userId"], where: notCancelled }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, provider: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: customerWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, provider: true, emailVerified: true, createdAt: true },
    }),
    prisma.user.count({ where: customerWhere }),
    // ลูกค้าประจำ: เรียงตามจำนวนคำสั่งซื้อ (ไม่นับที่ยกเลิก)
    prisma.order.groupBy({
      by: ["userId"],
      where: { ...notCancelled, user: { role: { not: "ADMIN" } } },
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
      orderBy: [{ _count: { userId: "desc" } }, { _sum: { total: "desc" } }],
      take: 10,
    }),
  ]);

  // ข้อมูลการซื้อของลูกค้าในหน้าปัจจุบัน + ลูกค้าประจำ
  const ids = [...new Set([...customers.map((c) => c.id), ...topAgg.map((t) => t.userId)])];
  const [statsAgg, topUsers, lastPhones] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: { ...notCancelled, userId: { in: customers.map((c) => c.id) } },
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
    }),
    prisma.user.findMany({ where: { id: { in: topAgg.map((t) => t.userId) } }, select: { id: true, name: true, email: true, provider: true } }),
    prisma.order.findMany({
      where: { userId: { in: ids } },
      orderBy: { createdAt: "desc" },
      distinct: ["userId"],
      select: { userId: true, phone: true },
    }),
  ]);
  const stats = (id: number) => statsAgg.find((s) => s.userId === id);
  const phoneOf = (id: number) => lastPhones.find((p) => p.userId === id)?.phone;
  const pages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const ordersHref = (email: string) => `/admin/orders?status=all&search=${encodeURIComponent(email)}`;
  const pageHref = (p: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <AdminPage wide>
      <PageHeader title="ลูกค้าและผู้ดูแล" description="จำนวนสมาชิก ผู้ดูแลระบบ และลูกค้าที่สั่งซื้อบ่อย" />

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ลูกค้าทั้งหมด" value={customerCount.toLocaleString()} sub="บัญชีที่สมัครสมาชิก" icon={Users} tone="brand" />
        <StatCard label="เคยสั่งซื้อ" value={buyerGroups.length.toLocaleString()} sub={`${customerCount ? Math.round((buyerGroups.length / customerCount) * 100) : 0}% ของลูกค้าทั้งหมด`} icon={Crown} tone="amber" />
        <StatCard label="สมาชิกใหม่เดือนนี้" value={newThisMonth.toLocaleString()} icon={UserPlus} tone="emerald" />
        <StatCard label="ผู้ดูแลระบบ" value={adminCount.toLocaleString()} sub="บัญชีที่เข้าหลังร้านได้" icon={ShieldCheck} tone="slate" />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        {/* ลูกค้าประจำ */}
        <Card title="ลูกค้าประจำ (สั่งบ่อยที่สุด)" padded={false} className="lg:col-span-3">
          {topAgg.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">ยังไม่มีข้อมูลการสั่งซื้อ</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {topAgg.map((t, i) => {
                const u = topUsers.find((x) => x.id === t.userId);
                const email = u ? displayEmail(u.email) : null;
                return (
                  <li key={t.userId}>
                    <Link href={u ? ordersHref(u.email) : "#"} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          i < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {u?.name || "ไม่ระบุชื่อ"} <ProviderBadge provider={u?.provider ?? null} />
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {[email, phoneOf(t.userId)].filter(Boolean).join(" · ") || "-"}
                          {t._max.createdAt && <> · สั่งล่าสุด {dateFmt.format(t._max.createdAt)}</>}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-slate-900">{t._count._all} ครั้ง</p>
                        <p className="text-xs text-slate-500">฿{Math.round(t._sum.total ?? 0).toLocaleString()}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="border-t border-slate-100 px-5 py-2 text-[11px] text-slate-400">ยอดซื้อรวมค่าจัดส่ง · ไม่นับคำสั่งซื้อที่ยกเลิก · กดเพื่อดูคำสั่งซื้อของลูกค้า</p>
        </Card>

        {/* ผู้ดูแลระบบ */}
        <Card title={`ผู้ดูแลระบบ (${adminCount})`} padded={false} className="lg:col-span-2">
          <ul className="divide-y divide-slate-100">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {(a.name || a.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {a.name || "ไม่ระบุชื่อ"} <ProviderBadge provider={a.provider} />
                  </p>
                  <p className="truncate text-xs text-slate-500">{displayEmail(a.email) ?? "ไม่มีอีเมล"}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">ตั้งแต่ {dateFmt.format(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* รายชื่อลูกค้าทั้งหมด */}
      <Card
        title={q ? `ผลการค้นหา "${q}" (${filteredCount})` : `ลูกค้าทั้งหมด (${customerCount})`}
        padded={false}
        action={
          <form method="GET" className="flex gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="ชื่อ อีเมล หรือเบอร์โทร" className={`${input} h-9 w-44 pl-9 sm:w-64`} />
            </div>
            <button className={`${btn.primary} h-9`}>ค้นหา</button>
          </form>
        }
      >
        {customers.length === 0 ? (
          <EmptyState icon={Users} title={q ? "ไม่พบลูกค้าที่ค้นหา" : "ยังไม่มีลูกค้า"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">ลูกค้า</th>
                  <th className="px-3 py-3">สมัครด้วย</th>
                  <th className="px-3 py-3">สมัครเมื่อ</th>
                  <th className="px-3 py-3 text-right">คำสั่งซื้อ</th>
                  <th className="px-3 py-3 text-right">ยอดซื้อรวม</th>
                  <th className="px-5 py-3">สั่งล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const s = stats(c.id);
                  const email = displayEmail(c.email);
                  const orders = s?._count._all ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">
                          {c.name || "ไม่ระบุชื่อ"}
                          {!c.emailVerified && c.provider === "credentials" && (
                            <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">ยังไม่ยืนยันอีเมล</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{[email, phoneOf(c.id)].filter(Boolean).join(" · ") || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <ProviderBadge provider={c.provider} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">{dateFmt.format(c.createdAt)}</td>
                      <td className="px-3 py-3 text-right">
                        {orders > 0 ? (
                          <Link href={ordersHref(c.email)} className="font-semibold text-brand-700 hover:underline">
                            {orders}
                          </Link>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-slate-900">
                        {orders > 0 ? `฿${Math.round(s?._sum.total ?? 0).toLocaleString()}` : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{s?._max.createdAt ? dateFmt.format(s._max.createdAt) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
            <span>
              หน้า {page} / {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={pageHref(page - 1)} className={`${btn.secondary} h-8`}>
                  <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
                </Link>
              )}
              {page < pages && (
                <Link href={pageHref(page + 1)} className={`${btn.secondary} h-8`}>
                  ถัดไป <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </AdminPage>
  );
}
