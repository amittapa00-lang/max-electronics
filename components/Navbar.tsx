"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // สร้าง State สำหรับควบคุมการเปิด-ปิดเมนูบนมือถือ
  const [isOpen, setIsOpen] = useState(false);

  // ซ่อน Navbar ปกติในหน้า Admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-extrabold text-blue-700 whitespace-nowrap"
            onClick={() => setIsOpen(false)}
          >
            MaxTech Electric
          </Link>

          {/* ── ปุ่มแฮมเบอร์เกอร์ขีดๆ (แสดงเฉพาะบนมือถือ md:hidden) ── */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {/* เส้นขีด 3 เส้น ใช้ Tailwind เล่นแอนิเมชันตอนกดเปิดจะเปลี่ยนเป็นกากบาท (X) */}
            <span className={`h-0.5 w-5 bg-emerald-500 rounded-full transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-0.5 w-5 bg-emerald-500 rounded-full transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-emerald-500 rounded-full transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          {/* ── เมนูสำหรับหน้าจอคอมพิวเตอร์ (md:flex ขนาดยกเลิกการแสดงผลบนมือถือ) ── */}
          <nav className="hidden md:flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-blue-600">หน้าแรก</Link>
            <Link href="/products" className="hover:text-blue-600">สินค้า</Link>
            <Link href="/problem" className="hover:text-blue-600">แจ้งปัญหา</Link>
            <Link href="/about" className="hover:text-blue-600">เกี่ยวกับเรา</Link>
            <Link href="/contact" className="hover:text-blue-600">ติดต่อเรา</Link>
            <Link href="/cart" className="hover:text-blue-600">🛒 ตะกร้าสินค้า</Link>
            {session && (
              <Link href="/orders" className="hover:text-blue-600">📦 ประวัติคำสั่งซื้อ</Link>
            )}
            <UserMenu />
          </nav>
        </div>
      </div>

      {/* ── แผงรายการเมนูเมื่อกดเปิดบนมือถือ (แสดงผลเฉพาะ md:hidden) ── */}
      <div 
        className={`md:hidden bg-white border-b transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-125 opacity-100 py-4" : "max-h-0 opacity-0 py-0 border-none"
        }`}
      >
        <nav className="flex flex-col px-6 gap-4 font-medium text-gray-700">
          <Link href="/" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            หน้าแรก
          </Link>
          <Link href="/products" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            สินค้า
          </Link>
          <Link href="/problem" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            แจ้งปัญหา
          </Link>
          <Link href="/about" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            เกี่ยวกับเรา
          </Link>
          <Link href="/contact" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            ติดต่อเรา
          </Link>
          <Link href="/cart" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
            🛒 ตะกร้าสินค้า
          </Link>
          {session && (
            <Link href="/orders" className="hover:text-blue-600 py-1 border-b border-gray-50" onClick={() => setIsOpen(false)}>
              📦 ประวัติคำสั่งซื้อ
            </Link>
          )}
          
          {/* ส่วนของเมนูผู้ใช้ (UserMenu) บนระบบมือถือ */}
          <div className="pt-2 flex justify-start">
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}