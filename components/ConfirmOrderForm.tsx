"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import UploadSlip from "./UploadSlip";
import ThailandAddress from "./ThailandAddress";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15";

export default function ConfirmOrderForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [note, setNote] = useState("");
  const [slip, setSlip] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!province || !district || !subdistrict) {
      setError("กรุณาเลือกจังหวัด อำเภอ/เขต และตำบล/แขวง ให้ครบ");
      return;
    }
    if (!slip) {
      setError("กรุณาอัปโหลดสลิปการโอนเงินก่อนยืนยันคำสั่งซื้อ");
      return;
    }

    const fullAddress = `
${address}
ตำบล/แขวง ${subdistrict}
อำเภอ/เขต ${district}
จังหวัด ${province}
${zipcode}
`;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address: fullAddress, note, slip }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setSubmitting(false);
        return;
      }

      window.dispatchEvent(new Event("cart:updated"));
      router.push(`/orders/${data.orderId}`);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. ผู้รับ */}
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-slate-900">ข้อมูลผู้รับ</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ชื่อ-นามสกุลผู้รับ">
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="เช่น สมชาย ใจดี" className={`${fieldClass} h-11`} />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08x-xxx-xxxx"
              className={`${fieldClass} h-11`}
            />
          </Field>
        </div>
      </fieldset>

      {/* 2. ที่อยู่ */}
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-slate-900">ที่อยู่จัดส่ง</legend>
        <Field label="บ้านเลขที่ อาคาร ซอย ถนน">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            autoComplete="street-address"
            placeholder="เช่น 99/1 หมู่ 5 ซ.สุขุมวิท 101 ถ.สุขุมวิท"
            className={`${fieldClass} h-20 py-2.5`}
          />
        </Field>
        <ThailandAddress
          onChange={(data) => {
            setProvince(data.province);
            setDistrict(data.district);
            setSubdistrict(data.subdistrict);
            setZipcode(data.zipcode);
          }}
        />
        <Field label="หมายเหตุถึงร้าน (ถ้ามี)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ต้องการใบกำกับภาษี / ส่งในเวลาทำการ"
            className={`${fieldClass} h-20 py-2.5`}
          />
        </Field>
      </fieldset>

      {/* 3. สลิป */}
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-slate-900">แนบสลิปการโอนเงิน</legend>
        <p className="mb-3 text-xs text-slate-500">โอนตามยอดชำระไปยังบัญชีด้านข้าง (หรือด้านล่างบนมือถือ) แล้วแนบสลิปที่นี่</p>
        <UploadSlip onUploaded={setSlip} />
      </fieldset>

      {error && (
        <p role="alert" className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4.5 w-4.5" />}
        {submitting ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
