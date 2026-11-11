import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type AuthUser = { id: number; role: string };

/** ผู้ใช้ที่ล็อกอินอยู่ (หรือ null) */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const id = Number(session?.user?.id);
  if (!session?.user || !Number.isFinite(id) || id <= 0) return null;
  return { id, role: session.user.role ?? "USER" };
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "ADMIN";
}

/** ใช้ใน API ของแอดมิน: คืน response 401/403 ถ้าไม่มีสิทธิ์ หรือ null ถ้าผ่าน */
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "ไม่มีสิทธิ์ใช้งาน" }, { status: 403 });
  return null;
}

/** ใช้ใน API ที่ต้องล็อกอิน: คืน response 401 ถ้ายังไม่ล็อกอิน หรือ null ถ้าผ่าน */
export async function requireUser(): Promise<NextResponse | null> {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  return null;
}

/** เจ้าของคำสั่งซื้อหรือแอดมินเท่านั้นที่เข้าถึงคำสั่งซื้อได้ */
export function canAccessOrder(user: AuthUser | null, order: { userId: number }): boolean {
  return !!user && (user.id === order.userId || isAdmin(user));
}
