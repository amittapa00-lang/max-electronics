
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { FcGoogle } from "react-icons/fc";
import { FaPhoneAlt } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [verified, setVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [checkingOtp, setCheckingOtp] = useState(false);

  async function sendOTP() {
    if (!email) {
      alert("กรุณากรอกอีเมล");
      return;
    }

    setLoadingOtp(true);
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoadingOtp(false);

    if (res.ok) {
      alert("ส่ง OTP เรียบร้อย กรุณาตรวจสอบอีเมล");
    } else {
      alert(data.error || "ส่ง OTP ไม่สำเร็จ");
    }
  }

  async function verifyOtpAuto(value: string) {
    if (value.length !== 6) {
      setVerified(false);
      return;
    }

    setCheckingOtp(true);
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: value }),
    });

    setCheckingOtp(false);
    setVerified(res.ok);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verified) {
      alert("กรุณายืนยัน OTP ก่อน");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "สมัครสมาชิกสำเร็จ");
      router.push("/login");
    } else {
      alert(data.error || "สมัครสมาชิกไม่สำเร็จ");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center p-5 relative overflow-hidden font-sans select-none antialiased">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-105 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.05)] p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-slate-900 rounded-xl shadow-xs text-lg text-white mb-3.5">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">สร้างบัญชีผู้ใช้ใหม่</h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">MaxTech Electric Automation</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">

 <button
  type="button"
  onClick={() => signIn("google")}
  className="
    flex items-center justify-center gap-3
    border border-slate-200
    rounded-xl
    py-3
    bg-white
    hover:bg-slate-50
    transition
  "
>
  <FcGoogle size={22} />

  <span className="font-medium">
    Google
  </span>
</button>

<button
  type="button"
  onClick={() =>
    alert("ระบบสมัครสมาชิกด้วยเบอร์โทรกำลังพัฒนา")
  }
  className="
    flex items-center justify-center gap-3
    border border-slate-200
    rounded-xl
    py-3
    bg-white
    hover:bg-slate-50
    transition
  "
>
  <FaPhoneAlt
    size={16}
    className="text-green-600"
  />

  <span className="font-medium">
    เบอร์โทรศัพท์
  </span>
</button>

</div>

<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-slate-200"></div>
  </div>

  <div className="relative flex justify-center">
    <span className="bg-white px-4 text-slate-400 text-sm">
      หรือสมัครสมาชิกด้วยอีเมล
    </span>
  </div>
</div>

        <form onSubmit={handleSubmit} className="space-y-4.5">
          {/* ชื่อ-นามสกุล */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">ชื่อ-นามสกุล</label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="สมชาย สายฟ้า"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-3 pl-4 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/5 transition-all"
              />
            </div>
          </div>

          {/* Email + ปุ่ม OTP (ปรับ Responsive) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">อีเมลผู้ใช้งาน</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={sendOTP}
                disabled={loadingOtp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                {loadingOtp ? "กำลังส่ง..." : "ส่งรหัส OTP"}
              </button>
            </div>
          </div>

          {/* รหัส OTP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">รหัสยืนยัน (OTP)</label>
            <input
              type="text"
              maxLength={6}
              placeholder="กรอกรหัส 6 หลัก"
              value={otp}
              onChange={async (e) => {
                const value = e.target.value;
                setOtp(value);
                await verifyOtpAuto(value);
              }}
              className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none font-mono font-bold tracking-widest transition-all"
            />
          </div>

          {/* สถานะ OTP */}
          {checkingOtp ? (
            <div className="text-slate-500 text-xs font-medium animate-pulse">กำลังตรวจสอบรหัส...</div>
          ) : otp.length === 6 && (
            <div className={`text-xs rounded-xl p-3 font-semibold ${verified ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {verified ? "✓ ยืนยัน OTP สำเร็จแล้ว" : "✕ รหัสไม่ถูกต้อง"}
            </div>
          )}

          {/* รหัสผ่าน */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">กำหนดรหัสผ่าน</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!verified}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all ${
              !verified ? "bg-slate-200 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            สร้างบัญชีสมาชิก
          </button>

          <div className="text-center text-xs text-slate-400">
            มีบัญชีอยู่แล้ว? <a href="/login" className="text-slate-900 font-bold hover:underline">เข้าสู่ระบบ</a>
          </div>
        </form>
      </div>
    </main>
  );
}