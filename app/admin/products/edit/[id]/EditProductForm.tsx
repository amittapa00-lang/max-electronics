"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  productCode: string | null;
  description: string;
  price: number;
  stock: number;
  quotationOnly: boolean;
  images: {
    id: number;
    imageUrl: string;
  }[];
  category: {
    id: number;
    name: string;
  } | null;
};

type Category = {
  id: number;
  name: string;
  parent?: {
    id: number;
    name: string;
  } | null;
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [productCode, setProductCode] = useState(product.productCode || "");
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [quotationOnly, setQuotationOnly] = useState(product.quotationOnly);
  const [stock, setStock] = useState(product.stock.toString());
  const [categoryId, setCategoryId] = useState(
    product.category?.id.toString() || ""
  );

  const [images, setImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState(product.images);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const newImagePreviews = images.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (incoming.length > 0) {
      setImages((prev) => [...prev, ...incoming]);
    }
  }

  function removeNewImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const imageUrls = currentImages.map((img) => img.imageUrl);

      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`กำลังอัปโหลดรูปที่ ${i + 1} จาก ${images.length}`);

        const formData = new FormData();
        formData.append("file", images[i]);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.imageUrl);
      }

      setUploadProgress(null);

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          productCode,
          description,
          price: quotationOnly ? 0 : Number(price),
          quotationOnly,
          stock: Number(stock),
          categoryId: Number(categoryId),
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
        setIsSubmitting(false);
      }
    } catch (_) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit}>
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                จัดการสินค้า
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                แก้ไขสินค้า
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting
                  ? uploadProgress || "กำลังบันทึก..."
                  : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                ข้อมูลพื้นฐาน
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อสินค้า</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">รหัสสินค้า</label>
                <input type="text" value={productCode} onChange={(e) => setProductCode(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-sm outline-none transition focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">รายละเอียดสินค้า</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-36 w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">ราคาและสต๊อก</h2>
            </div>
            <div className={`mb-4 flex items-start gap-3 rounded-xl border p-4 ${quotationOnly ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
              <input id="quotationOnly" type="checkbox" checked={quotationOnly} onChange={(e) => setQuotationOnly(e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
              <label htmlFor="quotationOnly" className="cursor-pointer text-sm font-semibold text-amber-800">📄 สินค้านี้ต้องขอใบเสนอราคา</label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">ราคา (บาท)</label>
                <input type="number" value={price} disabled={quotationOnly} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none disabled:bg-slate-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">จำนวนสินค้า</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-slate-900">หมวดหมู่</h2>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500">
              <option value="">เลือกหมวดหมู่</option>
              {categories.filter((cat) => !cat.parent).map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {categories.filter((cat) => cat.parent?.id === parent.id).map((child) => (
                    <option key={child.id} value={child.id}>└─ {child.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-slate-900">รูปภาพสินค้า</h2>
            {currentImages.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-4">
                {currentImages.map((img, idx) => (
                  <div key={img.id} className="group relative">
                    <Image src={img.imageUrl} alt={product.name} width={112} height={112} className="h-28 w-28 rounded-xl border border-slate-200 object-cover" />
                    <button type="button" onClick={() => setCurrentImages(currentImages.filter((i) => i.id !== img.id))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">×</button>
                  </div>
                ))}
              </div>
            )}
            {newImagePreviews.map((preview, idx) => (
              <div key={idx} className="group relative">
                <Image src={preview.url} alt="new" width={112} height={112} className="h-28 w-28 rounded-xl border border-indigo-200 object-cover" />
                <button type="button" onClick={() => removeNewImage(idx)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">×</button>
              </div>
            ))}
            <label onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }} className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50"}`}>
              <span>📷 ลากรูปมาวางที่นี่</span>
              <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} className="hidden" />
            </label>
          </section>
        </div>
      </form>
    </main>
  );
}