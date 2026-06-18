"use client";

import { useState } from "react";

export default function UploadSlip({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] =
    useState(false);

  async function uploadSlip(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const res = await fetch(
      "/api/upload-slip",
      {
        method: "POST",
        body: formData,
      }
    );

    const data =
      await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(
        data.error ||
          "อัปโหลดไม่สำเร็จ"
      );
      return;
    }

    onUploaded(
      data.imageUrl
    );

    alert(
      "อัปโหลดสลิปสำเร็จ"
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={uploadSlip}
      />

      {loading && (
        <p>
          กำลังอัปโหลด...
        </p>
      )}
    </div>
  );
}