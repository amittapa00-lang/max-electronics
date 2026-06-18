"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      const session = await getSession();

      if ((session?.user as { role?: string })?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      // 💡 แก้ไขจุดที่ 1: เปลี่ยนจาก catch (err) เป็น catch เฉยๆ เพื่อเคลียร์ข้อผิดพลาด Unused Variable ของ ESLint
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* 💡 แก้ไขจุดที่ 2: เปลี่ยนคลาสความกว้างสูงสุดจาก max-w-[400px] เป็น max-w-100 ตามระบบระเบียบ Tailwind v4 */}
      <div className="w-full max-w-100 bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:border-slate-200/60">
        
        {/* ส่วนหัวข้อและโลโก้ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-xl text-white mb-3">
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            MaxTech Electric
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs sm:text-sm font-medium">
            เข้าสู่ระบบจัดการและสั่งซื้อสินค้า
          </p>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ช่องกรอก Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">✉️</span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* ช่องกรอก Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔒</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* กล่องแจ้งเตือนความผิดพลาด (Error Message) */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* ปุ่มส่งข้อมูล (Submit Button) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm shadow-md transition-all duration-150 active:scale-99 ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังตรวจสอบข้อมูล...
                </span>
              ) : (
                "เข้าสู่ระบบใช้งาน"
              )}
            </button>
          </div>

          {/* ลิงก์ลืมรหัสผ่าน */}
          <div className="text-center pt-2">
            <a
              href="/forgot-password"
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors font-medium"
            >
              ลืมรหัสผ่านของคุณใช่ไหม?
            </a>
          </div>

        </form>
      </div>
    </main>
  );
}