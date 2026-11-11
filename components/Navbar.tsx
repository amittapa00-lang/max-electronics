"use client";

import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { Clock, Menu, Phone, Search, ShoppingCart, Truck, X, ShieldCheck } from "lucide-react";
import UserMenu from "./UserMenu";
import { LineIcon, SHOP_LINE_ID, SHOP_LINE_URL, SHOP_PHONE, SHOP_PHONE_TEL } from "./SocialIcons";

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้าทั้งหมด" },
  { href: "/problem", label: "แจ้งปัญหา" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [rawCartCount, setCartCount] = useState(0);
  const cartCount = session ? rawCartCount : 0;

  // ปิดเมนูมือถือทุกครั้งที่เปลี่ยนหน้า
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setIsOpen(false);
  }

  // อัปเดตตัวเลขตะกร้าเมื่อเปลี่ยนหน้า หรือเมื่อมีการเพิ่มสินค้า (event: cart:updated)
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const load = () => {
      fetch("/api/cart", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setCartCount(Number(data.count) || 0);
        })
        .catch(() => {
          // เงียบไว้ — ตัวเลขบนตะกร้าไม่ใช่ข้อมูลสำคัญ
        });
    };
    load();
    window.addEventListener("cart:updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("cart:updated", load);
    };
  }, [session, pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      {/* ── แถบข้อมูลติดต่อด้านบน ── */}
      <div className="hidden sm:block bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href={SHOP_PHONE_TEL} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3.5 w-3.5 text-brand-500" />
              <span className="font-medium">{SHOP_PHONE}</span>
            </a>
            <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <LineIcon className="h-3.5 w-3.5 text-[#06C755]" />
              <span>LINE {SHOP_LINE_ID}</span>
            </a>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              จ.–ศ. 08:30–17:30 · ส. 09:00–12:00
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-slate-500" /> จัดส่งทั่วประเทศ
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> รับประกันสินค้าทุกชิ้น
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_0_rgb(226_232_240)]">
        {/* ── แถวหลัก: โลโก้ / ค้นหา / ตะกร้า / บัญชี ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 md:h-20 flex items-center gap-3 md:gap-6">
            <button
              type="button"
              className="md:hidden -ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex items-center shrink-0" aria-label="MaxTech Electric หน้าแรก">
              <Image
                src="/LOGO_MaxTech.png"
                alt="MaxTech Electric"
                width={186}
                height={124}
                priority
                className="h-11 md:h-14 w-auto object-contain"
              />
              <span className="hidden lg:flex flex-col ml-3 leading-tight">
                <span className="text-[15px] font-bold text-slate-900">MaxTech Electric</span>
                <span className="text-[11px] text-slate-500">อุปกรณ์ไฟฟ้าอุตสาหกรรม</span>
              </span>
            </Link>

            {/* ค้นหา (Desktop) */}
            <div className="hidden md:block flex-1 max-w-2xl">
              <Suspense fallback={<SearchBoxFallback />}>
                <SearchBox />
              </Suspense>
            </div>

            <div className="ml-auto flex items-center gap-1 md:gap-3">
              <Link
                href="/cart"
                className="relative inline-flex h-11 items-center gap-2 rounded-lg px-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                aria-label={`ตะกร้าสินค้า ${cartCount} ชิ้น`}
              >
                <span className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-brand-600 text-white text-[11px] font-bold leading-5 text-center ring-2 ring-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:inline text-sm font-medium">ตะกร้า</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
                {session ? (
                  <UserMenu />
                ) : (
                  <>
                    <Link href="/login" className="h-10 inline-flex items-center px-3 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
                      เข้าสู่ระบบ
                    </Link>
                    <Link href="/register" className="h-10 inline-flex items-center px-4 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                      สมัครสมาชิก
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ค้นหา (Mobile) — แสดงตลอดเพื่อให้หาสินค้าได้ทันที */}
          <div className="md:hidden pb-3">
            <Suspense fallback={<SearchBoxFallback />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>

        {/* ── แถบเมนูสีแดง (Desktop) ── */}
        <nav className="hidden md:block bg-brand-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-11">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`h-full inline-flex items-center px-4 text-sm font-semibold transition-colors ${
                  isActive(l.href) ? "bg-brand-800 text-white" : "text-white/90 hover:bg-brand-700 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {session && (
              <Link
                href="/orders"
                className={`h-full inline-flex items-center px-4 text-sm font-semibold transition-colors ${
                  isActive("/orders") ? "bg-brand-800 text-white" : "text-white/90 hover:bg-brand-700 hover:text-white"
                }`}
              >
                คำสั่งซื้อของฉัน
              </Link>
            )}
            <a
              href={SHOP_PHONE_TEL}
              className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" /> ปรึกษาฟรี {SHOP_PHONE}
            </a>
          </div>
        </nav>

        {/* ── เมนูมือถือ ── */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white max-h-[calc(100vh-8rem)] overflow-y-auto">
            <nav className="px-4 py-3 flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-3 rounded-lg text-[15px] font-medium ${
                    isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/cart"
                className={`px-3 py-3 rounded-lg text-[15px] font-medium flex items-center justify-between ${
                  isActive("/cart") ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                ตะกร้าสินค้า
                {cartCount > 0 && (
                  <span className="min-w-6 h-6 px-1.5 rounded-full bg-brand-600 text-white text-xs font-bold leading-6 text-center">{cartCount}</span>
                )}
              </Link>
              {session && (
                <Link
                  href="/orders"
                  className={`px-3 py-3 rounded-lg text-[15px] font-medium ${
                    isActive("/orders") ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  คำสั่งซื้อของฉัน
                </Link>
              )}

              <div className="mt-3 pt-4 border-t border-slate-100">
                {session ? (
                  <div className="flex items-center justify-between gap-3 px-3">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-slate-700">
                      เข้าสู่ระบบ
                    </Link>
                    <Link href="/register" className="h-11 inline-flex items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
                      สมัครสมาชิก
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={SHOP_PHONE_TEL} className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white">
                  <Phone className="h-4 w-4" /> โทรหาเรา
                </a>
                <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#06C755] text-sm font-semibold text-white">
                  <LineIcon className="h-4 w-4" /> แชท LINE
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function SearchBox() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = pathname === "/products" ? searchParams.get("search") ?? "" : "";

  return (
    <Form action="/products" className="relative flex w-full">
      <input
        key={current}
        type="search"
        name="search"
        defaultValue={current}
        placeholder="ค้นหาชื่อสินค้า หรือรหัสรุ่น เช่น NV30-KC, E3Z-R61"
        autoComplete="off"
        className="h-11 w-full rounded-l-lg border border-r-0 border-slate-300 bg-white pl-4 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
      />
      <button
        type="submit"
        className="h-11 w-auto shrink-0 inline-flex items-center gap-2 rounded-r-lg bg-brand-600 px-4 md:px-5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        aria-label="ค้นหา"
      >
        <Search className="h-4.5 w-4.5" />
        <span className="hidden md:inline">ค้นหา</span>
      </button>
    </Form>
  );
}

function SearchBoxFallback() {
  return <div className="h-11 w-full rounded-lg border border-slate-300 bg-white" />;
}
