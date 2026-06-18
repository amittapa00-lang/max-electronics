"use client";

import Link from "next/link";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  children: {
    id: number;
    name: string;
  }[];
};

export default function CategorySidebar({
  categories,
  currentCategory,
  totalCount,
}: {
  categories: Category[];
  currentCategory?: string;
  totalCount: number;
}) {
  // สเตทสำหรับ เปิด/ปิด แผงเมนูทั้งหมดบนหน้าจอมือถือ (แก้ไขชื่อฟังก์ชันเป็น setIsMobileOpen ให้ตรงจุดเรียกใช้งาน)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .cat-sidebar * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        /* ── โครงสร้างหลัก (สไตล์เริ่มต้นสำหรับ Mobile-first) ── */
        .cat-sidebar {
          width: 100%; /* มือถือให้กว้างเต็มหน้าจอ */
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── ปุ่มแฮมเบอร์เกอร์ขีดๆ (แสดงเฉพาะบนมือถือ) ── */
        .cat-mobile-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          height: 48px;
          padding: 0 16px;
          background: #ffffff;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          color: #1E293B;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .cat-mobile-trigger:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        /* ดีไซน์ไอคอนขีด 3 ขีด (Hamburger) ด้วย CSS */
        .hamburger-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 20px;
        }

        .hamburger-line {
          height: 3px;
          width: 100%;
          background-color: #10B981; /* สีเขียวอมฟ้าสดใสตามตัวอย่างรูปภาพ */
          border-radius: 2px;
        }

        /* ── กล่องแสดงรายการหมวดหมู่ ── */
        .cat-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.06),
            0 4px 16px rgba(0,0,0,0.06);
          width: 100%;
          /* ควบคุมการ แสดง/ซ่อน ตามการคลิกปุ่มขีดๆ บนมือถือ */
          display: ${isMobileOpen ? "block" : "none"};
        }

        /* ── Header ── */
        .cat-header {
          padding: 20px 20px 18px;
          background: #0F172A;
          position: relative;
          overflow: hidden;
        }

        .cat-header::after {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        .cat-header-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366F1;
          margin-bottom: 4px;
        }

        .cat-header-title {
          font-size: 17px;
          font-weight: 700;
          color: #F8FAFC;
          margin: 0;
        }

        /* ── All Products row ── */
        .cat-all-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          text-decoration: none;
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.15s;
          position: relative;
        }

        .cat-all-link:hover {
          background: #F8FAFC;
        }

        .cat-all-link.active {
          background: #EEF2FF;
        }

        .cat-all-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #6366F1;
          border-radius: 0 2px 2px 0;
        }

        .cat-all-icon {
          font-size: 15px;
          margin-right: 9px;
        }

        .cat-all-text {
          font-size: 14px;
          font-weight: 600;
          color: #1E293B;
          flex: 1;
        }

        .cat-all-link.active .cat-all-text {
          color: #4F46E5;
        }

        .cat-count-badge {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          background: #F1F5F9;
          padding: 2px 8px;
          border-radius: 20px;
          line-height: 1.6;
        }

        .cat-all-link.active .cat-count-badge {
          background: #C7D2FE;
          color: #4338CA;
        }

        /* ── Category item ── */
        .cat-item {
          border-bottom: 1px solid #F1F5F9;
        }

        .cat-item:last-child {
          border-bottom: none;
        }

        .cat-row {
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 48px;
          transition: background 0.15s;
          position: relative;
          gap: 4px;
        }

        .cat-row:hover {
          background: #F8FAFC;
        }

        .cat-row.active {
          background: #EEF2FF;
        }

        .cat-row.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #6366F1;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
        }

        .cat-main-link {
          flex: 1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 48px;
        }

        .cat-row.active .cat-main-link {
          font-weight: 600;
          color: #4F46E5;
        }

        .cat-toggle-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          color: #94A3B8;
          transition: background 0.15s, color 0.15s, transform 0.2s;
          flex-shrink: 0;
          padding: 0;
        }

        .cat-toggle-btn:hover {
          background: #E2E8F0;
          color: #475569;
        }

        .cat-toggle-btn svg {
          width: 12px;
          height: 12px;
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
        }

        .cat-toggle-btn.open svg {
          transform: rotate(90deg);
        }

        /* ── Sub-categories ── */
        .cat-children {
          background: #FAFBFD;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        .cat-children.open {
          max-height: 500px;
        }

        .cat-sub-link {
          display: flex;
          align-items: center;
          padding: 9px 20px 9px 36px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          color: #64748B;
          transition: background 0.12s, color 0.12s;
          position: relative;
          gap: 8px;
          }

        .cat-sub-link:hover {
          background: #EEF2FF;
          color: #4F46E5;
        }

        .cat-sub-link.active {
          background: #EEF2FF;
          color: #4F46E5;
          font-weight: 600;
        }

        .cat-sub-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #6366F1;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 6px rgba(99,102,241,0.45);
        }

        .cat-sub-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #CBD5E1;
          flex-shrink: 0;
          transition: background 0.12s;
        }

        .cat-sub-link:hover .cat-sub-dot,
        .cat-sub-link.active .cat-sub-dot {
          background: #6366F1;
        }

        .cat-sub-name {
          flex: 1;
        }

        /* 💻 ── กฎควบคุมบนหน้าจอคอมพิวเตอร์และแท็บเล็ตใหญ่ (768px ขึ้นไป) ── */
        @media (min-width: 768px) {
          .cat-mobile-trigger {
            display: none; /* ซ่อนปุ่มกดขีดๆ ออกไปในหน้าจอคอม */
          }

          .cat-sidebar {
            width: 272px; /* ดึงความกว้าง 272px เดิมกลับคืนมาบนคอม */
          }

          .cat-card {
            display: block !important; /* บังคับกางแถบเมนูไว้ตลอดเวลา ไม่ซ่อนตามสเตท */
          }
        }
      `}</style>

      <aside className="cat-sidebar">
        {/* ปุ่มทริกเกอร์ แฮมเบอร์เกอร์ สำหรับจอมือถือ */}
        <button 
          className="cat-mobile-trigger"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          type="button"
        >
          <div className="hamburger-icon">
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
          <span>{currentCategory ? `หมวดหมู่: ${currentCategory}` : "เลือกหมวดหมู่สินค้า"}</span>
        </button>

        {/* แผงเนื้อหากล่องหมวดหมู่หลัก */}
        <div className="cat-card">

          {/* Header */}
          <div className="cat-header">
            <p className="cat-header-label">เลือกดูสินค้า</p>
            <h2 className="cat-header-title">หมวดหมู่สินค้า</h2>
          </div>

          {/* All Products */}
          <Link
            href="/products"
            className={`cat-all-link${!currentCategory ? " active" : ""}`}
            onClick={() => setIsMobileOpen(false)} // กดแล้วให้หุบเก็บเมนูอัตโนมัติบนมือถือ
          >
            <span className="cat-all-icon">📦</span>
            <span className="cat-all-text">สินค้าทั้งหมด</span>
            <span className="cat-count-badge">{totalCount}</span>
          </Link>

          {/* Categories */}
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              currentCategory={currentCategory}
              onLinkClick={() => setIsMobileOpen(false)} // ส่ง Event ปิดเมนูไปให้ลิสต์ย่อย
            />
          ))}

        </div>
      </aside>
    </>
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
  const [open, setOpen] = useState(childActive);

  const isActive = currentCategory === category.name;

  return (
    <div className="cat-item">
      <div className={`cat-row${isActive ? " active" : ""}`}>
        <Link
          href={`/products?category=${category.name}`}
          className="cat-main-link"
          onClick={onLinkClick} // จิ้มเลือกปุ๊บ สั่งปิดแถบเมนูในมือถือทันที
        >
          {category.name}
        </Link>

        {hasChildren && (
          <button
            type="button"
            className={`cat-toggle-btn${open ? " open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "ย่อหมวดหมู่ย่อย" : "ขยายหมวดหมู่ย่อย"}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,2 8,6 4,10" />
            </svg>
          </button>
        )}
      </div>

      {/* Sub-categories with CSS-driven animation */}
      {hasChildren && (
        <div className={`cat-children${open ? " open" : ""}`}>
          {category.children.map((sub) => {
            const subActive = currentCategory === sub.name;
            return (
              <Link
                key={sub.id}
                href={`/products?category=${sub.name}`}
                className={`cat-sub-link${subActive ? " active" : ""}`}
                onClick={onLinkClick} // จิ้มเลือกแบรนด์/หมวดย่อยปุ๊บ สั่งปิดแถบเมนูเช่นกัน
              >
                <span className="cat-sub-dot" />
                <span className="cat-sub-name">{sub.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}