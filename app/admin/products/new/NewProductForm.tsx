"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = {
  id: number;
  name: string;
  parent?: {
    id: number;
    name: string;
  } | null;
};

export default function NewProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  // States สำหรับเก็บข้อมูลฟอร์ม
  const [name, setName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quotationOnly, setQuotationOnly] = useState(false);
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 วิธีแก้: สร้าง URL สำหรับแสดงภาพตัวอย่าง Preview ตรงๆ ตอน Render 
  // ไม่ต้องใช้ useEffect และไม่ต้องมี State imagePreviews แยกต่างหาก
  const imagePreviews = images.map((image) => URL.createObjectURL(image));

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  // ฟังก์ชันสลับการลบรูปภาพบางรูปออกจากรายการที่เลือก
  const handleRemoveImage = (indexToRemove: number) => {
    // ลบ Object URL ของรูปที่จะถูกถอดออกเพื่อคืนหน่วยความจำ (Prevent Memory Leak)
    if (imagePreviews[indexToRemove]) {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);
    }
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const imageUrls: string[] = [];

      // วนลูปอัปโหลดไฟล์รูปภาพเข้า API Upload
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.imageUrl);
      }

      // บันทึกข้อมูลสินค้าทั้งหมดเข้าฐานข้อมูล
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  name,
  productCode,
  slug: generateSlug(name),
  description,

  price: quotationOnly ? 0 : Number(price),

  quotationOnly,

  stock: Number(stock),
  categoryId: Number(categoryId),
  images: imageUrls,
})
      });

      const data = await res.json();

      if (res.ok) {
        alert("เพิ่มสินค้าสำเร็จ");
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกสินค้า");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดระบบเครือข่าย กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 bg-slate-50 min-h-screen rounded-2xl shadow-xs mt-6 border border-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800">
          📦 เพิ่มสินค้าใหม่
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          กรอกรายละเอียดและอัปโหลดรูปภาพเพื่อเปิดวางจำหน่ายสินค้าในระบบคลัง
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ส่วนที่ 1: ข้อมูลพื้นฐาน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">ชื่อสินค้า <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="ตัวอย่าง: สายไฟทองแดง THW 1x1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">รหัสสินค้า / บาร์โค้ด <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="ตัวอย่าง: MAX-THW-001"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* รายละเอียดสินค้า */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">รายละเอียดสินค้า</label>
          <textarea
            placeholder="อธิบายคุณสมบัติ ขนาด แรงดันไฟฟ้า หรือข้อมูลทางเทคนิคของอุปกรณ์..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-200 p-3 rounded-xl bg-white h-36 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base resize-y"
          />
        </div>

        {/* ส่วนที่ 2: ราคา, คลัง, หมวดหมู่ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">ราคาสินค้า (฿) <span className="text-red-500">*</span></label>
            <input
  type="number"
  min="0"
  step="0.01"
  disabled={quotationOnly}
  required={!quotationOnly}
  placeholder={
    quotationOnly
      ? "สินค้านี้ใช้ใบเสนอราคา"
      : "0.00"
  }
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
/>
          </div>
          <div className="flex items-center gap-3 mt-3">
  <input
    id="quotationOnly"
    type="checkbox"
    checked={quotationOnly}
    onChange={(e) => setQuotationOnly(e.target.checked)}
    className="w-5 h-5"
  />

  <label
    htmlFor="quotationOnly"
    className="text-sm font-semibold text-red-600"
  >
    📄 สินค้านี้ต้องขอใบเสนอราคา
  </label>
</div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">จำนวนในสต็อก (ชิ้น) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-700">หมวดหมู่สินค้า <span className="text-red-500">*</span></label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
              required
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories
                .filter((cat) => !cat.parent)
                .map((parent) => (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{parent.name} (หมวดหลัก)</option>
                    {categories
                      .filter((cat) => cat.parent?.id === parent.id)
                      .map((child) => (
                        <option key={child.id} value={child.id}>
                          └─ {child.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </div>
        </div>

        {/* ส่วนที่ 3: อัปเดตรูปภาพสินค้าและการแสดง Image Preview */}
        <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-5">
          <label className="text-sm font-semibold text-slate-700">รูปภาพสินค้า (อัปโหลดได้หลายรูป)</label>
          <div className="relative flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white hover:bg-slate-100/50 hover:border-blue-400 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-2xl mb-1">📸</span>
                <p className="text-sm text-slate-600 font-medium">คลิกเพื่อเลือกไฟล์รูปภาพสินค้า</p>
                <p className="text-xs text-slate-400 mt-0.5">รองรับไฟล์ PNG, JPG, JPEG</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
          </div>

          {/* แผงแสดงรูปภาพ Preview */}
          {images.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-green-600 mb-2">เลือกแล้วจำนวน {images.length} รูป (คลิก ✕ ที่รูปเพื่อลบออก)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                    <Image
                      src={url}
                      alt={`preview-${index}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700 transition-all"
                      title="ลบรูปนี้ออก"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มบันทึกฟอร์มข้อมูล */}
        <div className="border-t border-slate-200 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 text-white font-bold rounded-xl shadow-md transition-all ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-98"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-pulse">⏳</span> กำลังบันทึกสินค้า...
              </span>
            ) : (
              "💾 บันทึกสินค้าใหม่"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}