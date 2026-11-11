"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Package, User } from "lucide-react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session) {
    return (
      <>
        <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600">
          เข้าสู่ระบบ
        </Link>
        <Link href="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          สมัครสมาชิก
        </Link>
      </>
    );
  }

  const name = session.user?.name || session.user?.email || "บัญชีของฉัน";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full md:w-auto items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
          {initial || <User className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 md:max-w-36 truncate text-sm font-semibold text-slate-800">{name}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-full md:w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link
            href="/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Package className="h-4 w-4 text-slate-400" /> คำสั่งซื้อของฉัน
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-brand-700 hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
