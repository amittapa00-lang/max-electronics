"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid, SlidersHorizontal, X } from "lucide-react";

type Category = {
  id: number;
  name: string;
  _count?: { products: number };
  children: {
    id: number;
    name: string;
    _count?: { products: number };
  }[];
};

const hrefFor = (name: string) => `/products?category=${encodeURIComponent(name)}`;

export default function CategorySidebar({
  categories,
  currentCategory,
  totalCount,
}: {
  categories: Category[];
  currentCategory?: string;
  totalCount: number;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const close = () => setIsMobileOpen(false);

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-36 md:self-start">
      {/* ปุ่มเปิดหมวดหมู่ (มือถือ) */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((v) => !v)}
        className="md:hidden flex w-full h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-left text-sm font-semibold text-slate-800"
        aria-expanded={isMobileOpen}
      >
        <SlidersHorizontal className="h-4.5 w-4.5 text-brand-600 shrink-0" />
        <span className="flex-1 truncate">{currentCategory ? currentCategory : "เลือกหมวดหมู่สินค้า"}</span>
        {isMobileOpen ? <X className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
      </button>

      <div
        className={`${isMobileOpen ? "block" : "hidden"} md:block mt-2 md:mt-0 overflow-hidden rounded-xl border border-slate-200 bg-white md:max-h-[calc(100vh-10rem)] md:overflow-y-auto`}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-900 px-4 py-3.5">
          <span className="h-4 w-1 rounded-full bg-brand-500" />
          <h2 className="text-sm font-semibold text-white">หมวดหมู่สินค้า</h2>
        </div>

        <Link
          href="/products"
          onClick={close}
          className={`flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 text-sm transition-colors ${
            !currentCategory ? "bg-brand-50 font-semibold text-brand-700 shadow-[inset_3px_0_0_0_var(--color-brand-600)]" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          <span className="flex-1">สินค้าทั้งหมด</span>
          <CountBadge n={totalCount} active={!currentCategory} />
        </Link>

        {categories.map((cat) => (
          <CategoryItem key={cat.id} category={cat} currentCategory={currentCategory} onLinkClick={close} />
        ))}
      </div>
    </aside>
  );
}

function CountBadge({ n, active }: { n?: number; active?: boolean }) {
  if (n === undefined) return null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
      }`}
    >
      {n}
    </span>
  );
}

function CategoryItem({
  category,
  currentCategory,
  onLinkClick,
}: {
  category: Category;
  currentCategory?: string;
  onLinkClick: () => void;
}) {
  const hasChildren = category.children.length > 0;
  const childActive = category.children.some((s) => s.name === currentCategory);
  const [open, setOpen] = useState(childActive || currentCategory === category.name);
  const isActive = currentCategory === category.name;
  const total =
    category._count !== undefined
      ? category._count.products + category.children.reduce((s, c) => s + (c._count?.products ?? 0), 0)
      : undefined;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div
        className={`flex items-center transition-colors ${
          isActive ? "bg-brand-50 shadow-[inset_3px_0_0_0_var(--color-brand-600)]" : "hover:bg-slate-50"
        }`}
      >
        <Link
          href={hrefFor(category.name)}
          onClick={onLinkClick}
          className={`flex flex-1 min-w-0 items-center gap-2 py-3 pl-4 pr-2 text-sm ${
            isActive ? "font-semibold text-brand-700" : "text-slate-700"
          }`}
        >
          <span className="flex-1 leading-snug">{category.name}</span>
          <CountBadge n={total} active={isActive} />
        </Link>

        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label={open ? "ย่อหมวดหมู่ย่อย" : "ขยายหมวดหมู่ย่อย"}
            aria-expanded={open}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div className="bg-slate-50/70 pb-1">
          {category.children.map((sub) => {
            const subActive = currentCategory === sub.name;
            return (
              <Link
                key={sub.id}
                href={hrefFor(sub.name)}
                onClick={onLinkClick}
                className={`flex items-center gap-2.5 py-2.5 pl-8 pr-4 text-[13px] transition-colors ${
                  subActive ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-white hover:text-brand-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${subActive ? "bg-brand-600" : "bg-slate-300"}`} />
                <span className="flex-1 leading-snug">{sub.name}</span>
                {sub._count && <span className="text-[11px] text-slate-400">{sub._count.products}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
