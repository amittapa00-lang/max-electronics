"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type SubCategory = { id: number; name: string };
type Category = { id: number; name: string; children: SubCategory[] };

async function persistOrder(items: { id: number; order: number }[]) {
  try {
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch (err) {
    console.error("บันทึกลำดับไม่สำเร็จ", err);
  }
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [, startTransition] = useTransition();

  // ---------- ลาก-วาง หมวดหมู่หลัก ----------
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function handleMainDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...categories];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setCategories(next);
    setDragIndex(null);
    startTransition(() => {
      persistOrder(next.map((c, i) => ({ id: c.id, order: i })));
    });
  }

  // ---------- ลาก-วาง หมวดย่อย (ภายในหมวดหลักเดียวกัน) ----------
  function handleSubDrop(
    parentIdx: number,
    subDragIndex: number,
    subDropIndex: number
  ) {
    if (subDragIndex === subDropIndex) return;
    const next = [...categories];
    const children = [...next[parentIdx].children];
    const [moved] = children.splice(subDragIndex, 1);
    children.splice(subDropIndex, 0, moved);
    next[parentIdx] = { ...next[parentIdx], children };
    setCategories(next);
    startTransition(() => {
      persistOrder(children.map((c, i) => ({ id: c.id, order: i })));
    });
  }

  return (
    <div className="space-y-6">
      {categories.map((cat, idx) => (
        <div
          key={cat.id}
          draggable
          onDragStart={() => setDragIndex(idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleMainDrop(idx)}
          className="bg-white border rounded-2xl shadow-sm overflow-hidden cursor-move"
        >
          {/* Main Category */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <span
                className="text-gray-400 select-none"
                title="ลากเพื่อจัดลำดับ"
              >
                ⠿
              </span>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                📁
              </div>

              <div>
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <p className="text-sm text-gray-500">
                  หมวดหลัก • {cat.children.length} หมวดย่อย
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
              >
                ✏️ แก้ไข
              </Link>

              <form action={`/api/admin/categories/${cat.id}`} method="POST">
                <button className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
                  🗑️ ลบ
                </button>
              </form>
            </div>
          </div>

          {/* Sub Categories */}
          {cat.children.length > 0 && (
            <div className="p-6 border-t">
              <div className="text-sm font-semibold text-gray-500 mb-4">
                หมวดย่อย (ลากเพื่อจัดลำดับ)
              </div>

              <SubCategoryList
                parentIdx={idx}
                items={cat.children}
                onDrop={handleSubDrop}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SubCategoryList({
  parentIdx,
  items,
  onDrop,
}: {
  parentIdx: number;
  items: SubCategory[];
  onDrop: (parentIdx: number, from: number, to: number) => void;
}) {
  const [subDragIndex, setSubDragIndex] = useState<number | null>(null);

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map((sub, subIdx) => (
        <div
          key={sub.id}
          draggable
          onDragStart={(e) => {
            e.stopPropagation(); // กันไม่ให้การ์ดหมวดหลักจับ event นี้ไปด้วย
            setSubDragIndex(subIdx);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.stopPropagation();
            if (subDragIndex !== null) {
              onDrop(parentIdx, subDragIndex, subIdx);
              setSubDragIndex(null);
            }
          }}
          className="border rounded-xl px-4 py-3 flex items-center justify-between bg-gray-50 cursor-move"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-300 select-none">⠿</span>
            <span className="text-gray-400">📂</span>
            <span className="font-medium">{sub.name}</span>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/admin/categories/${sub.id}/edit`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              แก้ไข
            </Link>

            <form action={`/api/admin/categories/${sub.id}`} method="POST">
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                ลบ
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}