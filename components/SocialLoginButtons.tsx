"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook, FaLine } from "react-icons/fa";
import { continueUrl } from "@/lib/authRedirect";

type ProviderId = "facebook" | "google" | "line" | "apple";

const PROVIDERS: { id: ProviderId; label: string; icon: React.ReactNode }[] = [
  { id: "facebook", label: "Facebook", icon: <FaFacebook size={24} className="text-[#1877F2]" /> },
  { id: "google", label: "Google", icon: <FcGoogle size={24} /> },
  { id: "line", label: "LINE", icon: <FaLine size={24} className="text-[#06C755]" /> },
  { id: "apple", label: "Apple", icon: <FaApple size={24} className="text-black" /> },
];

/**
 * แถวปุ่มไอคอนเข้าสู่ระบบด้วยบัญชีโซเชียล
 * แสดงเฉพาะช่องทางที่ตั้งค่า Client ID/Secret ไว้แล้วใน .env (Google แสดงเสมอ)
 */
export default function SocialLoginButtons({
  mode = "login",
  callbackUrl,
}: {
  mode?: "login" | "register";
  callbackUrl?: string;
}) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(["google"]));
  const [pending, setPending] = useState<ProviderId | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviders()
      .then((list) => {
        if (!cancelled && list) setEnabled(new Set(Object.keys(list)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = PROVIDERS.filter((p) => enabled.has(p.id));
  const verb = mode === "register" ? "สมัครสมาชิกด้วย" : "เข้าสู่ระบบด้วย";

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">
          {mode === "register" ? "สมัครสมาชิกด้วยบัญชีอื่นของคุณ" : "หรือ"}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-4 flex gap-3">
        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            title={`${verb} ${p.label}`}
            aria-label={`${verb} ${p.label}`}
            disabled={pending !== null}
            onClick={() => {
              setPending(p.id);
              // ไม่ระบุปลายทาง → ไปหน้ากลาง /auth/continue (แอดมินไป /admin, ลูกค้ากลับหน้าเดิม)
              signIn(p.id, { callbackUrl: callbackUrl ?? continueUrl() });
            }}
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
          >
            {pending === p.id ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              p.icon
            )}
            {/* มีช่องทางเดียว → แสดงชื่อด้วยให้ปุ่มไม่โล่ง */}
            {visible.length === 1 && <span>{`${verb} ${p.label}`}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
