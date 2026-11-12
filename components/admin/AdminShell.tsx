"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

export type AdminBadges = {
  ordersToDo: number;
  quotesPending: number;
};

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number; exact?: boolean };

export default function AdminShell({
  children,
  badges,
  userName,
}: {
  children: React.ReactNode;
  badges: AdminBadges;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openPath, setOpenPath] = useState(pathname);

  // ปิดเมนูมือถือเมื่อเปลี่ยนหน้า
  if (openPath !== pathname) {
    setOpenPath(pathname);
    setOpen(false);
  }

  const items: NavItem[] = [
    { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag, badge: badges.ordersToDo },
    { href: "/admin/products", label: "สินค้า", icon: Package },
    { href: "/admin/categories", label: "หมวดหมู่", icon: FolderTree },
    { href: "/admin/quotes", label: "ใบเสนอราคา", icon: FileText, badge: badges.quotesPending },
    { href: "/admin/users", label: "ลูกค้า", icon: Users },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(item.href + "/");

  const current = items.find(isActive);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <item.icon className={`h-5 w-5 ${active ? "text-brand-600" : "text-slate-400"}`} />
            <span className="flex-1">{item.label}</span>
            {!!item.badge && item.badge > 0 && (
              <span className="min-w-6 rounded-full bg-brand-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto space-y-1 border-t border-slate-100 pt-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <ExternalLink className="h-5 w-5 text-slate-400" /> ดูหน้าร้าน
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-slate-400" /> ออกจากระบบ
        </button>
        <p className="truncate px-3 pt-2 text-xs text-slate-400">เข้าสู่ระบบเป็น {userName}</p>
      </div>
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <Image src="/LOGO_MaxTech.png" alt="MaxTech" width={186} height={124} className="h-9 w-auto" priority />
      <span className="leading-tight">
        <span className="block text-sm font-bold text-slate-900">MaxTech Admin</span>
        <span className="block text-[11px] text-slate-500">ระบบหลังร้าน</span>
      </span>
    </Link>
  );

  return (
    <div className="admin-root min-h-screen bg-slate-50 print:min-h-0 print:bg-white">
      {/* Sidebar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex print:hidden!">
        <div className="flex h-16 items-center border-b border-slate-100 px-4">{brand}</div>
        {nav}
      </aside>

      {/* Top bar (Mobile) */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-3 lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-6 w-6" />
          {badges.ordersToDo > 0 && <span className="sr-only">มีคำสั่งซื้อรอดำเนินการ</span>}
        </button>
        <span className="flex-1 truncate font-semibold text-slate-900">{current?.label ?? "ระบบหลังร้าน"}</span>
        {badges.ordersToDo > 0 && (
          <Link
            href="/admin/orders"
            className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white"
          >
            งานค้าง {badges.ordersToDo}
          </Link>
        )}
      </header>

      {/* Drawer (Mobile) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="ปิดเมนู"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-60 print:pl-0!">{children}</div>
    </div>
  );
}
