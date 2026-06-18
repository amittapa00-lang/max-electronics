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
    /* ── พื้นหลังธีมสว่าง ไล่เฉดสีนุ่มนวล รองรับทุกขนาดหน้าจอ ── */
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* 💳 ตัวกล่องฟอร์มกระชับไม่ยืดบนคอม (max-w-100) และเพิ่มเงาพรีเมียม */}
      <div className="w-full max-w-100 bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:border-slate-200/60">
        
        {/* ส่วนหัวข้อและโลโก้ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-xl text-white mb-3">
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            สร้างบัญชีผู้ใช้ใหม่
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs sm:text-sm font-medium">
            กรอกข้อมูลเพื่อเข้าร่วมเป็นส่วนหนึ่งกับเรา
          </p>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ช่องกรอก ชื่อ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ชื่อ-นามสกุล (Full Name)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">👤</span>
              <input
                type="text"
                required
                placeholder="สมชาย สายฟ้า"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* ช่องกรอก Email และปุ่ม ส่ง OTP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
              <button
                type="button"
                onClick={sendOTP}
                disabled={loadingOtp}
                className={`px-4 rounded-xl font-bold text-xs shadow-xs transition-all duration-150 active:scale-95 ${
                  loadingOtp
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer"
                }`}
              >
                {loadingOtp ? "กำลังส่ง..." : "ส่ง OTP"}
              </button>
            </div>
          </div>

          {/* ช่องกรอกรหัส OTP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              รหัสยืนยัน (OTP Verification)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔑</span>
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
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all duration-150 tracking-widest font-mono"
              />
            </div>
          </div>

          {/* กล่องสถานะแจ้งเตือนเกี่ยวกับการตรวจสอบ OTP */}
          {checkingOtp && (
            <div className="text-blue-600 text-xs font-medium flex items-center gap-1.5 px-1">
              <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              กำลังตรวจสอบรหัส OTP...
            </div>
          )}

          {!checkingOtp && (
            verified ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl p-3 flex items-center gap-2">
                <span>✅</span> ยืนยัน OTP สำเร็จแล้ว
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 flex items-center gap-2">
                <span>❌</span> ยังไม่ได้ยืนยันรหัส OTP
              </div>
            )
          )}

          {/* ช่องกรอก Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              กำหนดรหัสผ่าน (Password)
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

          {/* ปุ่มส่งข้อมูลการสมัครสมาชิก */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!verified}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm shadow-md transition-all duration-150 active:scale-99 ${
                !verified
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* ย้อนกลับไปหน้าล็อกอิน */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400 font-medium">มีบัญชีอยู่แล้ว? </span>
            <a
              href="/login"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
            >
              เข้าสู่ระบบที่นี่
            </a>
          </div>

        </form>
      </div>
    </main>
  );
}