"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, ExternalLink, PackageCheck, Truck, Wallet } from "lucide-react";
import { getCarrierTracking } from "@/lib/carriers";
import { ORDER_STATUS } from "@/components/OrderStatusBadge";
import { btn, input } from "./ui";

const CARRIERS = ["Flash Express", "Kerry Express", "J&T Express", "Thailand Post", "SCG Express", "อื่น ๆ"];

const MANUAL_STATUSES = ["PENDING", "WAITING_VERIFY", "PAID", "PREPARING", "SHIPPING", "COMPLETED"];

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "ทำรายการไม่สำเร็จ");
  return data;
}

/** แผงขั้นตอนถัดไปของคำสั่งซื้อ — แสดงเฉพาะปุ่มที่ต้องใช้ในสถานะนั้น */
export default function OrderWorkflow({
  orderId,
  status,
  grandTotal,
  hasSlip,
  shippingCompany,
  trackingNumber,
}: {
  orderId: number;
  status: string;
  grandTotal: number;
  hasSlip: boolean;
  shippingCompany: string | null;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [carrier, setCarrier] = useState(shippingCompany || CARRIERS[0]);
  const [tracking, setTracking] = useState(trackingNumber || "");
  const [editTracking, setEditTracking] = useState(false);

  const working = busy || pending;
  const carrierSite = getCarrierTracking(shippingCompany);

  async function run(action: () => Promise<unknown>, confirmText?: string): Promise<boolean> {
    if (confirmText && !confirm(confirmText)) return false;
    setBusy(true);
    setError("");
    try {
      await action();
      startTransition(() => router.refresh());
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const setStatus = (to: string, confirmText?: string) =>
    run(() => postJson(`/api/admin/orders/${orderId}/status`, { status: to }), confirmText);

  const saveTracking = () =>
    run(() => {
      if (!tracking.trim()) return Promise.reject(new Error("กรุณากรอกเลขพัสดุ"));
      return postJson(`/api/admin/orders/${orderId}/tracking`, { shippingCompany: carrier, trackingNumber: tracking });
    }).then((ok) => ok && setEditTracking(false));

  const trackingForm = (
    <div className="space-y-2.5">
      <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={input} aria-label="บริษัทขนส่ง">
          {CARRIERS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="เลขพัสดุ เช่น TH0123456789"
          className={`${input} font-mono`}
          aria-label="เลขพัสดุ"
          onKeyDown={(e) => e.key === "Enter" && saveTracking()}
        />
      </div>
      <button type="button" onClick={saveTracking} disabled={working} className={`${btn.primary} w-full`}>
        <Truck className="h-4 w-4" /> บันทึกเลขพัสดุ และเปลี่ยนเป็น &quot;กำลังจัดส่ง&quot;
      </button>
    </div>
  );

  let main: React.ReactNode = null;

  if (status === "WAITING_VERIFY" || status === "PENDING") {
    main = (
      <>
        <Step icon={Wallet} title={hasSlip ? "ตรวจสอบสลิปการโอน" : "รอลูกค้าชำระเงิน"}>
          {hasSlip
            ? "เทียบยอดในสลิปกับยอดที่ต้องได้รับ แล้วกดยืนยัน (ระบบจะตัดสต็อกให้อัตโนมัติ)"
            : "ลูกค้ายังไม่ได้แนบสลิป หากได้รับเงินช่องทางอื่นแล้วกดยืนยันได้"}
        </Step>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">ยอดที่ต้องได้รับ</p>
          <p className="text-2xl font-bold text-slate-900">฿{grandTotal.toLocaleString()}</p>
        </div>
        <button
          type="button"
          disabled={working}
          onClick={() => setStatus("PAID", `ยืนยันว่าได้รับเงิน ฿${grandTotal.toLocaleString()} ถูกต้องแล้ว?`)}
          className={`${btn.primary} w-full h-11`}
        >
          <CheckCircle2 className="h-4 w-4" /> ยอดถูกต้อง ยืนยันการชำระเงิน
        </button>
      </>
    );
  } else if (status === "PAID") {
    main = (
      <>
        <Step icon={PackageCheck} title="แพ็กสินค้า">
          กด &quot;เริ่มแพ็กสินค้า&quot; เพื่อแจ้งลูกค้าว่ากำลังเตรียมของ หรือใส่เลขพัสดุได้เลยถ้าส่งแล้ว
        </Step>
        <button type="button" disabled={working} onClick={() => setStatus("PREPARING")} className={`${btn.primary} w-full h-11`}>
          <PackageCheck className="h-4 w-4" /> เริ่มแพ็กสินค้า
        </button>
        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-600">ส่งแล้ว? ใส่เลขพัสดุเลย</summary>
          <div className="mt-3">{trackingForm}</div>
        </details>
      </>
    );
  } else if (status === "PREPARING") {
    main = (
      <>
        <Step icon={Truck} title="ส่งสินค้าและใส่เลขพัสดุ">
          ลูกค้าจะเห็นเลขพัสดุในหน้าคำสั่งซื้อของตัวเองทันที
        </Step>
        {trackingForm}
      </>
    );
  } else if (status === "SHIPPING") {
    main = (
      <>
        <Step icon={Truck} title="กำลังจัดส่ง">
          เมื่อลูกค้าได้รับของแล้ว กดปิดงานเพื่อย้ายไปที่ &quot;สำเร็จ&quot;
        </Step>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{shippingCompany || "ขนส่ง"}</p>
            <p className="truncate font-mono font-semibold text-slate-900">{trackingNumber || "-"}</p>
          </div>
          <button type="button" onClick={() => setEditTracking((v) => !v)} className="w-auto text-sm font-medium text-brand-700 hover:underline">
            {editTracking ? "ยกเลิก" : "แก้ไข"}
          </button>
        </div>
        {carrierSite && (
          <a
            href={carrierSite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> เช็กสถานะที่เว็บ {carrierSite.name}
          </a>
        )}
        {editTracking && trackingForm}
        <button type="button" disabled={working} onClick={() => setStatus("COMPLETED")} className={`${btn.primary} w-full h-11`}>
          <CheckCircle2 className="h-4 w-4" /> ลูกค้าได้รับแล้ว ปิดงาน
        </button>
      </>
    );
  } else if (status === "COMPLETED") {
    main = (
      <Step icon={CheckCircle2} title="คำสั่งซื้อเสร็จสมบูรณ์">
        ไม่มีขั้นตอนที่ต้องทำต่อ
      </Step>
    );
  } else if (status === "CANCELLED") {
    main = (
      <Step icon={CheckCircle2} title="คำสั่งซื้อถูกยกเลิกแล้ว">
        หากยกเลิกผิด สามารถเปลี่ยนสถานะกลับได้จาก &quot;เปลี่ยนสถานะเอง&quot; ด้านล่าง
      </Step>
    );
  }

  return (
    <div className="space-y-3">
      {main}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {working && <p className="text-sm text-slate-500">กำลังบันทึก...</p>}

      <details className="border-t border-slate-100 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">เปลี่ยนสถานะเอง / ยกเลิกคำสั่งซื้อ</summary>
        <div className="mt-3 space-y-2">
          <select
            className={input}
            value=""
            disabled={working}
            onChange={(e) => {
              const to = e.target.value;
              if (to) setStatus(to, `เปลี่ยนสถานะเป็น "${ORDER_STATUS[to]?.label}"?`);
            }}
            aria-label="เปลี่ยนสถานะ"
          >
            <option value="">— เลือกสถานะ —</option>
            {MANUAL_STATUSES.filter((s) => s !== status).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS[s]?.label}
              </option>
            ))}
          </select>
          {status !== "CANCELLED" && (
            <button
              type="button"
              disabled={working}
              onClick={() => setStatus("CANCELLED", "ยืนยันยกเลิกคำสั่งซื้อนี้? (ถ้าตัดสต็อกไปแล้ว ระบบจะคืนสต็อกให้)")}
              className={`${btn.danger} w-full`}
            >
              ยกเลิกคำสั่งซื้อ
            </button>
          )}
        </div>
      </details>

      <p className="text-xs text-slate-400">ทุกครั้งที่เปลี่ยนสถานะหรือแก้เลขพัสดุ ระบบจะส่งอีเมลแจ้งลูกค้าอัตโนมัติ</p>
    </div>
  );
}

function Step({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{children}</p>
      </div>
    </div>
  );
}
