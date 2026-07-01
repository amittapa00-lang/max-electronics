"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminNavbar() {
return ( <header className="sticky top-0 z-50 bg-white border-b shadow-sm"> <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">


    <Link
      href="/admin"
      className="text-2xl font-extrabold text-slate-800"
    >
      MAX Admin
    </Link>

    <div className="flex items-center gap-3">

      <Link
        href="/admin/products"
        className="
          bg-blue-100
          hover:bg-blue-200
          text-slate-800
          px-4
          py-2
          rounded-lg
          font-medium
          transition
        "
      >
        📦 จัดการสินค้า
      </Link>

      <Link
        href="/admin/orders"
        className="
          bg-green-100
          hover:bg-green-200
          text-slate-800
          px-4
          py-2
          rounded-lg
          font-medium
          transition
        "
      >
        🛒 ออเดอร์
      </Link>

      <Link
        href="/admin/categories"
        className="
          bg-purple-100
          hover:bg-purple-200
          text-slate-800
          px-4
          py-2
          rounded-lg
          font-medium
          transition
        "
      >
        📂 หมวดหมู่
      </Link>

      <Link
        href="/admin/quotes"
        className="
          bg-purple-100
          hover:bg-purple-200
          text-slate-800
          px-4
          py-2
          rounded-lg
          font-medium
          transition
        "
      >
        ใบเสนอราคาทั้งหมด
      </Link>

      <button
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        className="
          bg-red-100
          hover:bg-red-200
          text-slate-800
          px-5
          py-2
          rounded-lg
          font-bold
          transition
        "
      >
        Logout
      </button>

    </div>
  </div>
</header>


);
}
