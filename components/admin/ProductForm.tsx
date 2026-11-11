"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { btn, input } from "./ui";

export type FormVariant = {
  id?: number;
  name: string;
  sku: string;
  price: string;
  stock: string;
  imageUrl: string;
};

export type ProductFormValue = {
  id?: number;
  name: string;
  productCode: string;
  description: string;
  price: string;
  stock: string;
  quotationOnly: boolean;
  categoryId: string;
  images: string[];
  variants: FormVariant[];
};

type Category = { id: number; name: string; parentId: number | null };

const label = "mb-1.5 block text-sm font-medium text-slate-700";

export default function ProductForm({ initial, categories }: { initial: ProductFormValue; categories: Category[] }) {
  const router = useRouter();
  const isEdit = !!initial.id;
  const [v, setV] = useState(initial);
  const [hasVariants, setHasVariants] = useState(initial.variants.length > 0);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) => setV((p) => ({ ...p, [k]: val }));
  const setVariant = (i: number, patch: Partial<FormVariant>) =>
    setV((p) => ({ ...p, variants: p.variants.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const variantStock = v.variants.reduce((s, x) => s + (Number(x.stock) || 0), 0);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setError("");
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.imageUrl) throw new Error(data.error || "อัปโหลดรูปไม่สำเร็จ");
        setV((p) => ({ ...p, images: [...p.images, data.imageUrl] }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function removeImage(url: string) {
    setV((p) => ({
      ...p,
      images: p.images.filter((x) => x !== url),
      variants: p.variants.map((x) => (x.imageUrl === url ? { ...x, imageUrl: "" } : x)),
    }));
  }

  function makeCover(url: string) {
    setV((p) => ({ ...p, images: [url, ...p.images.filter((x) => x !== url)] }));
  }

  function toggleVariants(on: boolean) {
    setHasVariants(on);
    if (on && v.variants.length === 0) {
      set("variants", [
        { name: "", sku: "", price: "", stock: v.stock || "0", imageUrl: "" },
        { name: "", sku: "", price: "", stock: "0", imageUrl: "" },
      ]);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || uploading > 0) return;
    setError("");

    if (hasVariants && v.variants.length === 0) {
      setError("กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการ หรือปิดการใช้ตัวเลือก");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/products/${v.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          productCode: v.productCode,
          description: v.description,
          price: v.quotationOnly ? 0 : Number(v.price),
          quotationOnly: v.quotationOnly,
          stock: Number(v.stock) || 0,
          categoryId: Number(v.categoryId),
          images: v.images,
          variants: hasVariants
            ? v.variants.map((x) => ({
                id: x.id,
                name: x.name,
                sku: x.sku,
                price: x.price === "" ? null : Number(x.price),
                stock: Number(x.stock) || 0,
                imageUrl: x.imageUrl || null,
              }))
            : [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      setSaving(false);
    }
  }

  const parents = categories.filter((c) => c.parentId === null);

  return (
    <form onSubmit={submit}>
      {/* แถบบันทึก */}
      <div className="sticky top-14 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:top-0">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">สินค้า</p>
            <h1 className="truncate text-lg font-semibold text-slate-900">{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => router.push("/admin/products")} className={btn.secondary}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving || uploading > 0} className={btn.primary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {uploading > 0 ? "รออัปโหลดรูป..." : saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {/* ข้อมูลพื้นฐาน */}
        <Section title="ข้อมูลพื้นฐาน">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>
                ชื่อสินค้า <span className="text-red-500">*</span>
              </label>
              <input required value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="เช่น ไฟสัญญาณ Fuji Electric DR22D0L (22mm)" className={input} />
            </div>
            <div>
              <label className={label}>รหัสสินค้า / รุ่น</label>
              <input value={v.productCode} onChange={(e) => set("productCode", e.target.value)} placeholder="เช่น DR22D0L-SET" className={`${input} font-mono`} />
            </div>
            <div>
              <label className={label}>
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select required value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={input}>
                <option value="">เลือกหมวดหมู่</option>
                {parents.map((p) => (
                  <optgroup key={p.id} label={p.name}>
                    <option value={p.id}>{p.name}</option>
                    {categories
                      .filter((c) => c.parentId === p.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          └ {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>รายละเอียดสินค้า</label>
              <textarea
                value={v.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="สเปก ขนาด แรงดันไฟฟ้า การใช้งาน ฯลฯ"
                className={`${input} h-36 resize-y py-2`}
              />
            </div>
          </div>
        </Section>

        {/* รูปภาพ */}
        <Section title="รูปภาพสินค้า" hint="รูปแรกคือรูปปก · กด ★ เพื่อตั้งเป็นรูปปก">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {v.images.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image src={url} alt={`รูปที่ ${i + 1}`} fill sizes="160px" className="object-contain p-1" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">ปก</span>}
                <div className="absolute right-1 top-1 flex gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => makeCover(url)} title="ตั้งเป็นรูปปก" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-amber-500 shadow">
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(url)} title="ลบรูป" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-red-600 shadow">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ))}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                uploadFiles(e.dataTransfer.files);
              }}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-center text-xs font-medium transition ${
                dragging ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              <ImagePlus className="h-6 w-6" />
              เพิ่มรูป
              <span className="font-normal text-slate-400">หรือลากมาวาง</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
            </label>
          </div>
        </Section>

        {/* ราคาและสต็อก */}
        <Section title="ราคาและสต็อก">
          <label className={`mb-4 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${v.quotationOnly ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
            <input type="checkbox" checked={v.quotationOnly} onChange={(e) => set("quotationOnly", e.target.checked)} className="h-5 w-5 shrink-0 accent-amber-600" />
            <span className="text-sm">
              <span className="font-semibold text-slate-800">สินค้านี้ต้องขอใบเสนอราคา</span>
              <span className="block text-xs text-slate-500">ลูกค้าจะเห็นปุ่ม &quot;ขอใบเสนอราคา&quot; แทนการใส่ตะกร้า</span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>ราคา (บาท){!v.quotationOnly && <span className="text-red-500"> *</span>}</label>
              <input
                type="number"
                min="0"
                required={!v.quotationOnly}
                disabled={v.quotationOnly}
                value={v.quotationOnly ? "" : v.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder={v.quotationOnly ? "ใช้ใบเสนอราคา" : "0"}
                className={`${input} disabled:bg-slate-100`}
              />
              {hasVariants && <p className="mt-1 text-xs text-slate-500">ราคานี้ใช้กับตัวเลือกที่ไม่ได้กำหนดราคาเอง</p>}
            </div>
            <div>
              <label className={label}>จำนวนในสต็อก (ชิ้น)</label>
              {hasVariants ? (
                <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  รวมจากตัวเลือก: <span className="ml-1 font-semibold text-slate-900">{variantStock}</span>
                </div>
              ) : (
                <input type="number" min="0" value={v.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" className={input} />
              )}
            </div>
          </div>
        </Section>

        {/* ตัวเลือกสินค้า */}
        <Section
          title="ตัวเลือกสินค้า"
          hint="เช่น สีขาว/ใส กับ สีแดง ในรหัสรุ่นเดียวกัน — ลูกค้าต้องเลือกก่อนใส่ตะกร้า"
          action={
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={hasVariants} onChange={(e) => toggleVariants(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              มีหลายตัวเลือก
            </label>
          }
        >
          {!hasVariants ? (
            <p className="text-sm text-slate-500">สินค้านี้มีแบบเดียว · เปิด &quot;มีหลายตัวเลือก&quot; หากมีหลายสี/ขนาดในรหัสเดียวกัน</p>
          ) : (
            <div className="space-y-3">
              <div className="hidden grid-cols-[56px_1fr_130px_110px_90px_36px] gap-2 px-1 text-xs font-semibold text-slate-500 md:grid">
                <span>รูป</span>
                <span>ชื่อตัวเลือก *</span>
                <span>รหัสเฉพาะ</span>
                <span>ราคา (เว้นว่าง = ราคาหลัก)</span>
                <span>สต็อก</span>
                <span />
              </div>
              {v.variants.map((x, i) => (
                <div key={x.id ?? `new-${i}`} className="rounded-lg border border-slate-200 p-3 md:border-0 md:p-0">
                  <div className="grid grid-cols-[56px_1fr_36px] gap-2 md:grid-cols-[56px_1fr_130px_110px_90px_36px] md:items-center">
                    {/* รูปของตัวเลือก */}
                    <button
                      type="button"
                      onClick={() => setPickerFor(pickerFor === i ? null : i)}
                      title="เลือกรูปของตัวเลือกนี้"
                      className={`relative row-span-2 h-14 w-14 overflow-hidden rounded-lg border bg-white md:row-span-1 ${pickerFor === i ? "border-brand-500 ring-2 ring-brand-500/20" : "border-slate-200"}`}
                    >
                      {x.imageUrl ? (
                        <Image src={x.imageUrl} alt={x.name} fill sizes="56px" className="object-contain p-0.5" />
                      ) : (
                        <ImagePlus className="m-auto h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <input
                      value={x.name}
                      onChange={(e) => setVariant(i, { name: e.target.value })}
                      placeholder="เช่น สีขาว/ใส"
                      className={input}
                      aria-label="ชื่อตัวเลือก"
                    />
                    <button
                      type="button"
                      onClick={() => setV((p) => ({ ...p, variants: p.variants.filter((_, j) => j !== i) }))}
                      title="ลบตัวเลือก"
                      className="flex h-10 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 md:order-last"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="col-span-2 grid grid-cols-3 gap-2 md:contents">
                      <input value={x.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} placeholder="รหัส" className={`${input} font-mono`} aria-label="รหัสเฉพาะ" />
                      <input
                        type="number"
                        min="0"
                        value={x.price}
                        onChange={(e) => setVariant(i, { price: e.target.value })}
                        placeholder={v.price ? `฿${v.price}` : "ราคา"}
                        className={input}
                        aria-label="ราคา"
                      />
                      <input type="number" min="0" value={x.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} placeholder="สต็อก" className={input} aria-label="สต็อก" />
                    </div>
                  </div>

                  {pickerFor === i && (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                      {v.images.length === 0 ? (
                        <p className="text-xs text-slate-500">เพิ่มรูปสินค้าด้านบนก่อน แล้วค่อยเลือกรูปให้ตัวเลือก</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {v.images.map((url) => (
                            <button
                              type="button"
                              key={url}
                              onClick={() => {
                                setVariant(i, { imageUrl: url });
                                setPickerFor(null);
                              }}
                              className={`relative h-14 w-14 overflow-hidden rounded-md border bg-white ${x.imageUrl === url ? "border-brand-600 ring-2 ring-brand-600/30" : "border-slate-200"}`}
                            >
                              <Image src={url} alt="" fill sizes="56px" className="object-contain p-0.5" />
                            </button>
                          ))}
                          {x.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setVariant(i, { imageUrl: "" });
                                setPickerFor(null);
                              }}
                              className="h-14 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600"
                            >
                              ไม่ใช้รูป
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => set("variants", [...v.variants, { name: "", sku: "", price: "", stock: "0", imageUrl: "" }])}
                className={btn.secondary}
              >
                <Plus className="h-4 w-4" /> เพิ่มตัวเลือก
              </button>
            </div>
          )}
        </Section>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
