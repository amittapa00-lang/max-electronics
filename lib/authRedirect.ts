/**
 * ลิงก์ไปหน้ากลางหลังเข้าสู่ระบบ (/auth/continue) พร้อมส่งต่อหน้าที่ผู้ใช้ตั้งใจจะเปิด
 * ใช้ฝั่งเบราว์เซอร์เท่านั้น (อ่าน callbackUrl จาก URL ปัจจุบัน)
 */
export function continueUrl(): string {
  if (typeof window === "undefined") return "/auth/continue";
  const raw = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!raw) return "/auth/continue";

  let path = raw;
  try {
    // callbackUrl อาจเป็นลิงก์เต็ม — รับเฉพาะลิงก์ในเว็บเดียวกัน
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return "/auth/continue";
    path = u.pathname + u.search;
  } catch {
    return "/auth/continue";
  }
  return `/auth/continue?callbackUrl=${encodeURIComponent(path)}`;
}
