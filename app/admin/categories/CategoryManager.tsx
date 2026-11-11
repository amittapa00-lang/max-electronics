"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { btn, input } from "@/components/admin/ui";

export type SubNode = { id: number; name: string; products: number };
export type CategoryNode = SubNode & { children: SubNode[] };

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "ทำรายการไม่สำเร็จ");
  return data;
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CategoryManager({ initialCategories }: { initialCategories: CategoryNode[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // sync กับข้อมูลจากเซิร์ฟเวอร์ทุกครั้งที่ refresh
  const [source, setSource] = useState(initialCategories);
  const [categories, setCategories] = useState(initialCategories);
  if (source !== initialCategories) {
    setSource(initialCategories);
    setCategories(initialCategories);
  }

  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [addingSubTo, setAddingSubTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [newMain, setNewMain] = useState("");
  const [drag, setDrag] = useState<{ parent: number | null; index: number } | null>(null);

  async function run(action: () => Promise<unknown>, okText?: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      if (okText) setMessage({ type: "ok", text: okText });
      startTransition(() => router.refresh());
      return true;
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ" });
      startTransition(() => router.refresh());
      return false;
    } finally {
      setBusy(false);
    }
  }

  const saveOrder = (items: { id: number }[]) =>
    run(() => api("/api/admin/categories/reorder", "POST", { items: items.map((c, i) => ({ id: c.id, order: i })) }));

  function reorderMain(from: number, to: number) {
    if (to < 0 || to >= categories.length || from === to) return;
    const next = move(categories, from, to);
    setCategories(next);
    saveOrder(next);
  }

  function reorderSub(parentIdx: number, from: number, to: number) {
    const children = categories[parentIdx].children;
    if (to < 0 || to >= children.length || from === to) return;
    const nextChildren = move(children, from, to);
    const next = [...categories];
    next[parentIdx] = { ...next[parentIdx], children: nextChildren };
    setCategories(next);
    saveOrder(nextChildren);
  }

  const rename = (id: number, name: string) =>
    run(() => api(`/api/admin/categories/${id}`, "PATCH", { name }), "บันทึกชื่อแล้ว").then((ok) => ok && setEditing(null));

  const remove = (node: SubNode, childCount = 0) => {
    if (childCount > 0) {
      setMessage({ type: "error", text: `"${node.name}" ยังมีหมวดย่อย ${childCount} หมวด ย้ายหรือลบหมวดย่อยก่อน` });
      return;
    }
    if (node.products > 0) {
      setMessage({ type: "error", text: `"${node.name}" ยังมีสินค้า ${node.products} รายการ ย้ายสินค้าไปหมวดอื่นก่อนจึงจะลบได้` });
      return;
    }
    if (!confirm(`ลบหมวด "${node.name}"?`)) return;
    run(() => api(`/api/admin/categories/${node.id}`, "DELETE"), `ลบ "${node.name}" แล้ว`);
  };

  const moveTo = (node: SubNode, parentId: number | null, parentName: string) =>
    run(() => api(`/api/admin/categories/${node.id}`, "PATCH", { parentId }), `ย้าย "${node.name}" ไป ${parentName} แล้ว`);

  const addCategory = (name: string, parentId: number | null) =>
    run(() => api("/api/admin/categories", "POST", { name, parentId }), `เพิ่ม "${name.trim()}" แล้ว`);

  const q = query.trim().toLowerCase();
  const matches = (name: string) => !q || name.toLowerCase().includes(q);
  const visible = categories
    .map((c, idx) => ({ c, idx, subs: c.children.map((s, sIdx) => ({ s, sIdx })).filter(({ s }) => matches(s.name) || matches(c.name)) }))
    .filter(({ c, subs }) => matches(c.name) || subs.length > 0);

  const allCollapsed = categories.length > 0 && collapsed.size === categories.length;
  const toggle = (id: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* เพิ่มหมวดหลัก + ค้นหา */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[1fr_auto_1fr]">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newMain.trim()) return;
            addCategory(newMain, null).then((ok) => ok && setNewMain(""));
          }}
        >
          <input
            value={newMain}
            onChange={(e) => setNewMain(e.target.value)}
            placeholder="ชื่อหมวดหลักใหม่ เช่น เซ็นเซอร์ (Sensor)"
            className={input}
            aria-label="ชื่อหมวดหลักใหม่"
          />
          <button disabled={busy || !newMain.trim()} className={`${btn.primary} shrink-0`}>
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">เพิ่มหมวดหลัก</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </form>
        <div className="hidden w-px bg-slate-200 lg:block" />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาหมวดหมู่" className={`${input} pl-9`} />
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(categories.map((c) => c.id)))}
            className={`${btn.secondary} shrink-0`}
          >
            <span>
              {allCollapsed ? "ขยาย" : "ย่อ"}
              <span className="hidden sm:inline">ทั้งหมด</span>
            </span>
          </button>
        </div>
      </div>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="ปิด" className="shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        จัดลำดับได้ด้วยปุ่มลูกศร <ArrowUp className="inline h-3 w-3" /> <ArrowDown className="inline h-3 w-3" /> หรือลากที่{" "}
        <GripVertical className="inline h-3 w-3" /> (บนคอมพิวเตอร์) · กดตัวเลขสินค้าเพื่อดูสินค้าในหมวดนั้น
      </p>

      {visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          {q ? `ไม่พบหมวดหมู่ "${query}"` : "ยังไม่มีหมวดหมู่ เริ่มเพิ่มหมวดหลักด้านบนได้เลย"}
        </div>
      )}

      <ul className="space-y-3">
        {visible.map(({ c, idx, subs }) => {
          const open = !collapsed.has(c.id) || !!q;
          const total = c.products + c.children.reduce((s, ch) => s + ch.products, 0);
          const isDragOver = drag?.parent === null && drag.index !== idx;
          return (
            <li
              key={c.id}
              onDragOver={(e) => drag?.parent === null && e.preventDefault()}
              onDrop={() => {
                if (drag?.parent === null) reorderMain(drag.index, idx);
                setDrag(null);
              }}
              className={`overflow-hidden rounded-xl border bg-white transition ${isDragOver ? "border-brand-300" : "border-slate-200"}`}
            >
              {/* หมวดหลัก */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-3 sm:flex-nowrap sm:px-4">
                <span
                  draggable={!q}
                  onDragStart={() => setDrag({ parent: null, index: idx })}
                  onDragEnd={() => setDrag(null)}
                  className="hidden cursor-grab text-slate-300 hover:text-slate-500 md:block"
                  title="ลากเพื่อจัดลำดับ"
                >
                  <GripVertical className="h-5 w-5" />
                </span>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label={open ? "ย่อ" : "ขยาย"}
                >
                  {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {open ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                </span>

                <div className={`min-w-0 flex-1 ${editing === c.id ? "basis-full sm:basis-auto" : ""}`}>
                  {editing === c.id ? (
                    <NameEditor initial={c.name} busy={busy} onSave={(n) => rename(c.id, n)} onCancel={() => setEditing(null)} />
                  ) : (
                    <>
                      <p className="line-clamp-2 font-semibold leading-snug text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        <Link href={`/admin/products?category=${c.id}`} className="hover:text-brand-700 hover:underline">
                          {total} สินค้า
                        </Link>{" "}
                        · {c.children.length} หมวดย่อย
                      </p>
                    </>
                  )}
                </div>

                {editing !== c.id && (
                  <div className="ml-auto flex w-full shrink-0 items-center justify-end border-t border-slate-100 pt-1 sm:w-auto sm:border-0 sm:pt-0">
                    <IconBtn label="เลื่อนขึ้น" disabled={busy || idx === 0 || !!q} onClick={() => reorderMain(idx, idx - 1)}>
                      <ArrowUp className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="เลื่อนลง"
                      disabled={busy || idx === categories.length - 1 || !!q}
                      onClick={() => reorderMain(idx, idx + 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="เพิ่มหมวดย่อย"
                      onClick={() => {
                        setAddingSubTo(c.id);
                        setCollapsed((p) => {
                          const n = new Set(p);
                          n.delete(c.id);
                          return n;
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="แก้ไขชื่อ" onClick={() => setEditing(c.id)}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="ลบ" danger disabled={busy} onClick={() => remove(c, c.children.length)}>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                )}
              </div>

              {/* หมวดย่อย */}
              {open && (c.children.length > 0 || addingSubTo === c.id) && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 sm:pl-14 sm:pr-4">
                  <ul className="divide-y divide-slate-100">
                    {subs.map(({ s, sIdx }) => (
                      <li
                        key={s.id}
                        onDragOver={(e) => {
                          if (drag?.parent === c.id) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onDrop={(e) => {
                          if (drag?.parent === c.id) {
                            e.stopPropagation();
                            reorderSub(idx, drag.index, sIdx);
                          }
                          setDrag(null);
                        }}
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 sm:flex-nowrap"
                      >
                        <span
                          draggable={!q}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDrag({ parent: c.id, index: sIdx });
                          }}
                          onDragEnd={() => setDrag(null)}
                          className="hidden cursor-grab text-slate-300 hover:text-slate-500 md:block"
                          title="ลากเพื่อจัดลำดับ"
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <Folder className="h-4 w-4 shrink-0 text-slate-400" />

                        {/* มือถือ: ชื่ออยู่บรรทัดแรกเต็มความกว้าง ปุ่มลงบรรทัดถัดไป */}
                        <div className="min-w-0 flex-1 basis-[calc(100%-1.5rem)] sm:basis-auto">
                          {editing === s.id ? (
                            <NameEditor initial={s.name} busy={busy} onSave={(n) => rename(s.id, n)} onCancel={() => setEditing(null)} />
                          ) : (
                            <p className="text-sm text-slate-800 sm:truncate">
                              {s.name}{" "}
                              <Link
                                href={`/admin/products?category=${s.id}`}
                                className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200 hover:text-brand-700"
                              >
                                {s.products} สินค้า
                              </Link>
                            </p>
                          )}
                        </div>

                        {editing !== s.id && (
                          <div className="ml-auto flex shrink-0 items-center">
                            <select
                              value=""
                              disabled={busy}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === "root") moveTo(s, null, "หมวดหลัก");
                                else if (v) {
                                  const target = categories.find((x) => x.id === Number(v));
                                  if (target) moveTo(s, target.id, `"${target.name}"`);
                                }
                              }}
                              className="mr-1 h-8 w-auto max-w-36 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600"
                              aria-label={`ย้าย ${s.name} ไปหมวดอื่น`}
                            >
                              <option value="">ย้ายไป…</option>
                              {categories
                                .filter((x) => x.id !== c.id)
                                .map((x) => (
                                  <option key={x.id} value={x.id}>
                                    {x.name}
                                  </option>
                                ))}
                              <option value="root">— ตั้งเป็นหมวดหลัก —</option>
                            </select>
                            <IconBtn label="เลื่อนขึ้น" disabled={busy || sIdx === 0 || !!q} onClick={() => reorderSub(idx, sIdx, sIdx - 1)}>
                              <ArrowUp className="h-4 w-4" />
                            </IconBtn>
                            <IconBtn
                              label="เลื่อนลง"
                              disabled={busy || sIdx === c.children.length - 1 || !!q}
                              onClick={() => reorderSub(idx, sIdx, sIdx + 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </IconBtn>
                            <IconBtn label="แก้ไขชื่อ" onClick={() => setEditing(s.id)}>
                              <Pencil className="h-4 w-4" />
                            </IconBtn>
                            <IconBtn label="ลบ" danger disabled={busy} onClick={() => remove(s)}>
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {addingSubTo === c.id && (
                    <div className="py-2">
                      <NameEditor
                        initial=""
                        placeholder={`ชื่อหมวดย่อยใน "${c.name}"`}
                        saveLabel="เพิ่ม"
                        busy={busy}
                        onSave={(n) => addCategory(n, c.id).then((ok) => ok && setAddingSubTo(null))}
                        onCancel={() => setAddingSubTo(null)}
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function NameEditor({
  initial,
  onSave,
  onCancel,
  busy,
  placeholder,
  saveLabel = "บันทึก",
}: {
  initial: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  busy: boolean;
  placeholder?: string;
  saveLabel?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSave(value);
      }}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        placeholder={placeholder}
        className={`${input} h-9`}
      />
      <button disabled={busy || !value.trim()} className={`${btn.primary} h-9 shrink-0 px-3`}>
        <Check className="h-4 w-4" /> {saveLabel}
      </button>
      <button type="button" onClick={onCancel} className={`${btn.secondary} h-9 shrink-0 px-3`} aria-label="ยกเลิก">
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
