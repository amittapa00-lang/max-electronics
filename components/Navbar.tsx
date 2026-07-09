"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 border-b border-slate-100 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
            className="text-2xl font-extrabold text-blue-600 tracking-tight whitespace-nowrap hover:opacity-90 transition-opacity"
            onClick={() => setIsOpen(false)}
          >
            MaxTech <span className="text-slate-900 font-medium text-xl sm:text-2xl">Electric</span>
          </Link>

          {/* ปุ่มแฮมเบอร์เกอร์ */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full hover:bg-slate-50 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.25 w-5 justify-center items-center">
              <span className={`h-0.5 w-5 bg-slate-800 rounded-full transition-all duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-1.75" : ""}`} />
              <span className={`h-0.5 w-5 bg-slate-800 rounded-full transition-all duration-200 ease-in-out ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-slate-800 rounded-full transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-1.75" : ""}`} />
            </div>
          </button>

          {/* เมนู Desktop */}
          <nav className="hidden md:flex items-center gap-6 font-semibold text-sm text-slate-600">
            <Link href="/" prefetch={true} className="hover:text-blue-600 transition-colors">หน้าแรก</Link>
            <Link href="/products" prefetch={true} className="hover:text-blue-600 transition-colors">สินค้า</Link>
            <Link href="/problem" prefetch={true} className="hover:text-blue-600 transition-colors">แจ้งปัญหา</Link>
            <Link href="/about" prefetch={true} className="hover:text-blue-600 transition-colors">เกี่ยวกับเรา</Link>
            <Link href="/contact" prefetch={true} className="hover:text-blue-600 transition-colors">ติดต่อเรา</Link>
            <Link href="/cart" prefetch={true} className="hover:text-blue-600 transition-colors">🛒 ตะกร้าสินค้า</Link>
            {session && (
              <Link href="/orders" prefetch={true} className="hover:text-blue-600 transition-colors">📦 ประวัติคำสั่งซื้อ</Link>
            )}

            <div className="pl-4 border-l border-slate-200 flex items-center gap-3">
              {session ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/login" prefetch={true} className="text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-bold transition-all">เข้าสู่ระบบ</Link>
                  <Link href="/register" prefetch={true} className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all duration-200">สมัครสมาชิก</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* เมนู Mobile */}
      <div className={`md:hidden bg-white border-t border-slate-50 transition-all duration-200 ease-in-out ${isOpen ? "block opacity-100" : "hidden opacity-0"}`}>
        <nav className="flex flex-col px-6 py-4 gap-1.5 font-semibold text-slate-600">
          <Link href="/" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>หน้าแรก</Link>
          <Link href="/products" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>สินค้า</Link>
          <Link href="/problem" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>แจ้งปัญหา</Link>
          <Link href="/about" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>เกี่ยวกับเรา</Link>
          <Link href="/contact" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>ติดต่อเรา</Link>
          <Link href="/cart" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>🛒 ตะกร้าสินค้า</Link>
          {session && (
            <Link href="/orders" prefetch={true} className="hover:text-blue-600 hover:bg-slate-50/80 px-3 py-2.5 rounded-xl transition-all" onClick={() => setIsOpen(false)}>📦 ประวัติคำสั่งซื้อ</Link>
          )}
          
          <div className="pt-4 mt-2 border-t border-slate-100 px-3">
            {session ? (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400">บัญชีผู้ใช้ของคุณ:</span>
                <UserMenu />
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Link href="/login" prefetch={true} className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm" onClick={() => setIsOpen(false)}>เข้าสู่ระบบ</Link>
                <Link href="/register" prefetch={true} className="w-full text-center py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xs transition-all text-sm" onClick={() => setIsOpen(false)}>สมัครสมาชิก</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}