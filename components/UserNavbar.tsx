import Link from "next/link";
import UserMenu from "./UserMenu";

export default function UserNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link
          href="/"
          className="text-3xl font-extrabold text-blue-700"
        >
          MAX Electronics
        </Link>

        <nav className="flex items-center gap-6">

          <Link href="/">หน้าแรก</Link>

          <Link href="/products">
            สินค้า
          </Link>

          <Link href="/about">
            เกี่ยวกับเรา
          </Link>

          <Link href="/contact">
            ติดต่อเรา
          </Link>

          <Link href="/cart">
            🛒 ตะกร้าสินค้า
          </Link>

          <UserMenu />

        </nav>

      </div>
    </header>
  );
}