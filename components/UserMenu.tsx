"use client";

import {
  signOut,
  useSession,
} from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session } =
    useSession();

  if (!session) {
    return (
      <>
        <Link
          href="/login"
          className="hover:text-blue-600"
        >
          เข้าสู่ระบบ
        </Link>

        <Link
          href="/register"
          className="
            bg-blue-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          สมัครสมาชิก
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="font-medium">
        👋 {session.user?.name}
      </span>

      <button
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        className="
          bg-red-500
          hover:bg-red-600
          text-white
          px-4
          py-2
          rounded-lg
        "
      >
        Logout
      </button>
    </>
  );
}