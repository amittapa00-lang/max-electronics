import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** ส่วนหัวของหน้าแอดมิน */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** กรอบเนื้อหาของหน้า */
export function AdminPage({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <main className={`mx-auto px-4 py-6 sm:px-6 lg:py-8 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>{children}</main>;
}

export function Card({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/** การ์ดตัวเลขสรุป (กดได้ถ้ามี href) */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  href?: string;
  tone?: "slate" | "brand" | "amber" | "sky" | "emerald";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  const body = (
    <div className="flex items-start gap-3">
      {Icon && (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
  const cls = "block rounded-xl border border-slate-200 bg-white p-4";
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-brand-300 hover:shadow-sm`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon?: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      {Icon && <Icon className="h-10 w-10 text-slate-300" />}
      <p className="font-semibold text-slate-700">{title}</p>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60",
};

export const input =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15";

export const thb = (n: number) => `฿${Math.round(n).toLocaleString()}`;
