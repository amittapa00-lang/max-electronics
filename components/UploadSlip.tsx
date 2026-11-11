"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

export default function UploadSlip({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  async function uploadSlip(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-slip", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      setPreview(data.imageUrl);
      onUploaded(data.imageUrl);
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed px-4 py-4 transition-colors ${
          preview ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 hover:border-brand-400 hover:bg-brand-50/30"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="สลิปที่อัปโหลด" className="h-20 w-16 shrink-0 rounded border border-slate-200 object-cover" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </span>
        )}
        <span className="min-w-0 flex-1">
          {loading ? (
            <span className="block text-sm font-semibold text-slate-700">กำลังอัปโหลด...</span>
          ) : preview ? (
            <>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> อัปโหลดสลิปแล้ว
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">แตะเพื่อเปลี่ยนรูป</span>
            </>
          ) : (
            <>
              <span className="block text-sm font-semibold text-slate-800">แตะเพื่อเลือกรูปสลิป</span>
              <span className="mt-0.5 block text-xs text-slate-500">รองรับไฟล์ JPG, PNG</span>
            </>
          )}
        </span>
        <input type="file" accept="image/*" onChange={uploadSlip} disabled={loading} className="sr-only" />
      </label>

      {error && <p role="alert" className="text-sm text-brand-700">{error}</p>}
    </div>
  );
}
