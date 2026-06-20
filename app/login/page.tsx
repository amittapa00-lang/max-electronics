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
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none antialiased">
      
      {/* 🌐 Background Tech Pattern: อัปเดตคลาสเป็นรูปแบบมาตรฐานของ v4 เรียบร้อย */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 📦 ฟอร์มการ์ดสไตล์พรีเมียม คลีน สมส่วนทุกหน้าจอ */}
      <div className="w-full max-w-105 bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 sm:p-10 relative z-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        
        {/* ส่วนหัวข้อและโลโก้แบรนด์ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-b from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-500/10 text-xl text-white mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            MaxTech Electric
          </h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">
            Industrial Electronics &amp; Automation
          </p>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ช่องกรอก Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400 transition-all duration-150 font-medium"
              />
            </div>
          </div>

          {/* ช่องกรอก Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* กล่องแจ้งข้อผิดพลาด (Error) */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* 🚀 ปุ่มส่งข้อมูล (Submit Button) สไตล์ Electric Blue เปล่งแสงพรีเมียม */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-200 active:scale-[0.99] ${
                loading
                  ? "bg-blue-600/50 text-blue-100 cursor-not-allowed shadow-none"
                  : "bg-linear-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(37,99,235,0.5)] cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-medium text-blue-100">กำลังตรวจสอบข้อมูล...</span>
                </span>
              ) : (
                "เข้าสู่ระบบใช้งาน"
              )}
            </button>
          </div>

          {/* ลิงก์ลืมรหัสผ่าน */}
          <div className="text-center pt-1">
            <a
              href="/forgot-password"
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors font-semibold"
            >
              ลืมรหัสผ่านของคุณใช่ไหม?
            </a>
          </div>

        </form>
      </div>
    </main>
  );
}