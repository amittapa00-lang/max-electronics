"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: value,
      }),
    });

    setCheckingOtp(false);

    if (res.ok) {
      setVerified(true);
    } else {
      setVerified(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!verified) {
      alert("กรุณายืนยัน OTP ก่อน");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
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
      
      {/* 🥞 Soft Ambient Glow: แสงฟุ้งละมุนด้านหลัง ช่วยขับให้การ์ดสีสว่างดูนุ่มนวลและมีมิติ */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />

      {/* 📦 การ์ดฟอร์มสีขาวพรีเมียม สไตล์ละมุนตา (Soft Premium Card) */}
      <div className="w-full max-w-105 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.05)] p-8 sm:p-10 relative z-10">
        
        {/* Header ส่วนหัวข้อแบบคลีนเรียบหรู */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-slate-900 rounded-xl shadow-xs text-lg text-white mb-3.5">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            สร้างบัญชีผู้ใช้ใหม่
          </h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">
            MaxTech Electric Automation
          </p>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit} className="space-y-4.5">
          
          {/* ช่องกรอก ชื่อ-นามสกุล */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
              ชื่อ-นามสกุล (Full Name)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </span>
              <input
                type="text"
                required
                placeholder="สมชาย สายฟ้า"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/5 placeholder:text-slate-400 transition-all duration-150 font-medium"
              />
            </div>
          </div>

          {/* ช่องกรอก Email + ปุ่มส่ง OTP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-slate-800 transition-colors">
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
                  className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/5 placeholder:text-slate-400 transition-all duration-150 font-medium"
                />
              </div>
              <button
                type="button"
                onClick={sendOTP}
                disabled={loadingOtp}
                className={`px-4 rounded-xl font-bold text-xs border transition-all duration-200 active:scale-[0.97] whitespace-nowrap ${
                  loadingOtp
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs cursor-pointer"
                }`}
              >
                {loadingOtp ? "กำลังส่ง..." : "ส่ง OTP"}
              </button>
            </div>
          </div>

          {/* ช่องกรอกรหัส OTP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
              รหัสยืนยัน (OTP Verification)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
              </span>
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
                className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/5 placeholder:text-slate-400 transition-all duration-150 tracking-widest font-mono font-bold"
              />
            </div>
          </div>

          {/* กล่องข้อความแจ้งสถานะ OTP (ปรับสีพาสเทลแบบหรูหรา) */}
          {checkingOtp && (
            <div className="text-slate-500 text-xs font-medium flex items-center gap-2 px-1 animate-pulse">
              <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              กำลังตรวจสอบรหัส OTP...
            </div>
          )}

          {!checkingOtp && (
            verified ? (
              <div className="bg-emerald-50 text-emerald-700 text-xs rounded-xl p-3 flex items-center gap-2 animate-[fadeIn_0.15s_ease-out] border border-emerald-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-emerald-600 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="font-semibold">ยืนยัน OTP สำเร็จแล้ว</span>
              </div>
            ) : (
              <div className="bg-rose-50 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2 animate-[fadeIn_0.15s_ease-out] border border-rose-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="font-semibold">ยังไม่ได้ยืนยันรหัส OTP</span>
              </div>
            )
          )}

          {/* ช่องกรอก กำหนดรหัสผ่าน */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
              กำหนดรหัสผ่าน (Password)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-3.25 text-slate-400 group-focus-within:text-slate-800 transition-colors">
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
                className="w-full bg-slate-100/60 border border-slate-200/80 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/5 placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* 🚀 ปุ่มส่งข้อมูลการสมัครสมาชิก (Submit) สไตล์ Solid Bold */}
          <div className="pt-2.5">
            <button
              type="submit"
              disabled={!verified}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-[0.99] ${
                !verified
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-slate-900 hover:bg-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.2)] cursor-pointer"
              }`}
            >
              สร้างบัญชีสมาชิก
            </button>
          </div>

          {/* ลิงก์สลับไปหน้าล็อกอิน */}
          <div className="text-center pt-1">
            <span className="text-xs text-slate-400 font-medium">มีบัญชีอยู่แล้ว? </span>
            <a
              href="/login"
              className="text-xs text-slate-900 hover:underline font-bold transition-all"
            >
              เข้าสู่ระบบที่นี่
            </a>
          </div>

        </form>
      </div>
    </main>
  );
}