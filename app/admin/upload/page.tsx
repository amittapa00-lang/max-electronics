"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  async function uploadFile() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    alert(data.url);
  }

  return (
    <main className="max-w-xl mx-auto py-20">
      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={uploadFile}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Upload
      </button>
    </main>
  );
}