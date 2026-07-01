"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 📦 ฟอร์มการ์ดสไตล์พรีเมียม */}
      <div className="w-full max-w-105 bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 sm:p-10 relative z-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-b from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-500/10 text-xl text-white mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MaxTech Electric</h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">Industrial Electronics & Automation</p>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button type="button" onClick={() => signIn("google")} className="flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 bg-white hover:bg-slate-50 transition">
            <FcGoogle size={22} />
            <span className="font-medium">Google</span>
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-slate-400 text-sm">หรือเข้าสู่ระบบด้วยอีเมล</span>
          </div>
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
              className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
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
              className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
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
                  ? "bg-blue-600/50 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)]"
              }`}
            >
              {loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบใช้งาน"}
            </button>
          </div>

          <div className="text-center pt-1">
            <a href="/forgot-password" className="text-xs text-slate-400 hover:text-blue-600 font-semibold">ลืมรหัสผ่านของคุณใช่ไหม?</a>
          </div>
        </form>
      </div>
    </main>
  );
}