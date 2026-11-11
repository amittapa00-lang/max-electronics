import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/** อนุญาตเฉพาะลิงก์ภายในเว็บ (กันการพาไปเว็บอื่น) */
function safePath(raw?: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/auth/") ? raw : null;
}

/**
 * หน้ากลางหลังเข้าสู่ระบบ (ทั้งอีเมลและ Google/LINE/Facebook)
 * - แอดมิน → /admin (หรือหน้าแอดมินที่ตั้งใจจะเปิด)
 * - ลูกค้า → หน้าที่ตั้งใจจะเปิด หรือหน้าแรก
 */
export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const target = safePath(callbackUrl);

  if (session.user?.role === "ADMIN") {
    redirect(target?.startsWith("/admin") ? target : "/admin");
  }

  redirect(target && !target.startsWith("/admin") && target !== "/login" ? target : "/");
}
