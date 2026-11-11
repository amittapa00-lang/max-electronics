"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SocialLoginButtons from "@/components/SocialLoginButtons";

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
      {/* 🌐 Background Tech Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-brand-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 📦 ฟอร์มการ์ดสไตล์พรีเมียม */}
      <div className="w-full max-w-105 bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 sm:p-10 relative z-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-b from-brand-500 to-brand-600 rounded-xl shadow-md shadow-brand-500/10 text-xl text-white mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MaxTech Electric</h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">Industrial Electronics & Automation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ช่องกรอก Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">อีเมลผู้ใช้งาน (Email)</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all"
            />
          </div>

          {/* ช่องกรอก Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">รหัสผ่าน (Password)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 flex items-center gap-2">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* ปุ่ม Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all ${
                loading 
                  ? "bg-brand-600/50 cursor-not-allowed" 
                  : "bg-brand-600 hover:bg-brand-700 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)]"
              }`}
            >
              {loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบใช้งาน"}
            </button>
          </div>

          <div className="text-center pt-1">
            <a href="/forgot-password" className="text-xs text-slate-400 hover:text-brand-600 font-semibold">ลืมรหัสผ่านของคุณใช่ไหม?</a>
          </div>
        </form>

        {/* เข้าสู่ระบบด้วยบัญชีอื่น */}
        <div className="mt-6">
          <SocialLoginButtons mode="login" />
        </div>
      </div>
    </main>
  );
}