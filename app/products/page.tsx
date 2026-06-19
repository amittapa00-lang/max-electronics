import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import CategorySidebar from "@/components/CategorySidebar";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}) {
  const { category, search } = await searchParams;

  const categories = (await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  })) ?? [];

  const products = await prisma.product.findMany({
    where: {
      AND: [
        category
          ? {
              category: {
                OR: [
                  { name: category },
                  { parent: { name: category } },
                ],
              },
            }
          : {},
        search
          ? {
              OR: [
                { name: { contains: search } },
                { productCode: { contains: search } },
              ],
            }
          : {},
      ],
    },
    include: {
      category: { include: { parent: true } },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = await prisma.product.count();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .pg-root * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        /* ── Page Layout ── */
        .pg-root {
          min-height: 100vh;
          background: #F8FAFC;
          padding: 20px 16px 60px;
        }

        /* ── Top Bar ── */
        .pg-topbar {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          margin-bottom: 24px;
          gap: 16px;
        }

        .pg-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366F1;
          margin-bottom: 4px;
        }

        .pg-title {
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          line-height: 1.2;
        }

        /* ── Search Bar ── */
        .pg-search-wrap {
          display: flex;
          position: relative;
          width: 100%;
          gap: 8px;
        }

        .pg-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
          font-size: 16px;
          line-height: 1;
          z-index: 10;
        }

        .pg-search-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          padding: 0 16px 0 42px;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          background: #fff;
          color: #1E293B;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .pg-search-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .pg-search-btn {
          flex-shrink: 0;
          background: #6366F1;
          color: #fff;
          border: none;
          border-radius: 12px;
          height: 44px;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .pg-search-btn:hover {
          background: #4F46E5;
        }

        /* ── Body Layout ── */
        .pg-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .pg-content {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        /* ── Result meta ── */
        .pg-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pg-result-count {
          font-size: 13px;
          color: #64748B;
        }

        .pg-result-count strong {
          color: #1E293B;
          font-weight: 600;
        }

        .pg-active-filter {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px 4px 12px;
          border-radius: 20px;
          text-decoration: none;
        }

        .pg-filter-x {
          width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #C7D2FE;
          border-radius: 50%;
          font-size: 10px;
          color: #4338CA;
        }

        /* ── Product Grid ── */
        .pg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* ── Product Card ── */
        .pg-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #F1F5F9;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        }

        .pg-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: #E0E7FF;
        }

        .pg-card-img-wrap {
          position: relative;
          height: 140px;
          background: #F1F5F9;
          overflow: hidden;
        }

        .pg-card-img {
          transition: transform 0.3s ease;
        }

        .pg-card:hover .pg-card-img {
          transform: scale(1.06);
        }

        .pg-card-out-of-stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pg-card-out-badge {
          font-size: 11px;
          font-weight: 700;
          color: #991B1B;
          background: #FEE2E2;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .pg-card-body {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 4px;
        }

        .pg-card-cat {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6366F1;
        }

        .pg-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 36px;
          margin: 0;
        }

        .pg-card-code {
          font-size: 11px;
          color: #94A3B8;
          font-family: monospace;
        }

        .pg-card-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          margin-top: auto;
        }

        .pg-price {
          font-size: 16px;
          font-weight: 700;
          color: #DC2626;
          line-height: 1;
        }

        .pg-price-thb {
          font-size: 11px;
          font-weight: 500;
          margin-right: 1px;
        }

        .pg-stock-ok {
          font-size: 10px;
          font-weight: 500;
          color: #15803D;
          background: #DCFCE7;
          padding: 2px 6px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* ── Empty State ── */
        .pg-empty {
          grid-column: 1 / -1;
          padding: 60px 20px;
          text-align: center;
        }

        .pg-empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.35;
        }

        .pg-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #1E293B;
          margin: 0 0 6px;
        }

        .pg-empty-sub {
          font-size: 14px;
          color: #94A3B8;
        }

        /* 💻 ── Desktop Layout ── */
        @media (min-width: 768px) {
          .pg-root {
            padding: 40px 40px 80px;
          }

          .pg-topbar {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }

          .pg-title {
            font-size: 26px;
          }

          .pg-search-wrap {
            max-width: 400px;
          }

          .pg-body {
            flex-direction: row;
            align-items: flex-start;
          }

          .pg-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .pg-card-img-wrap {
            height: 180px;
          }

          .pg-card-body {
            padding: 14px 14px 16px;
          }

          .pg-card-name {
            font-size: 13.5px;
          }

          .pg-card-footer {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }

          .pg-price {
            font-size: 18px;
          }
        }
      `}</style>

      <main className="pg-root">
        {/* Top bar */}
        <div className="pg-topbar">
          <div className="pg-title-group">
            <p className="pg-eyebrow">คลังสินค้า</p>
            <h1 className="pg-title">สินค้าทั้งหมด</h1>
          </div>

          <form action="/products" className="pg-search-wrap">
            <span className="pg-search-icon">🔍</span>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="ค้นหาชื่อสินค้า / รหัสสินค้า..."
              className="pg-search-input"
              autoComplete="off"
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <button type="submit" className="pg-search-btn">ค้นหา</button>
          </form>
        </div>

        {/* Body */}
        <div className="pg-body">
          <CategorySidebar
            categories={categories}
            currentCategory={category}
            totalCount={totalCount}
          />

          <div className="pg-content">
            {/* Result meta */}
            <div className="pg-meta">
              <p className="pg-result-count">
                พบ <strong>{products.length}</strong> รายการ
                {search && <> สำหรับ &ldquo;<strong>{search}</strong>&rdquo;</>}
              </p>

              {(category || search) && (
                <Link href="/products" className="pg-active-filter">
                  {category && <span>{category}</span>}
                  {search && !category && <span>&ldquo;{search}&rdquo;</span>}
                  <span className="pg-filter-x">✕</span>
                </Link>
              )}
            </div>

            {/* Grid */}
            <div className="pg-grid">
              {products.length === 0 ? (
                <div className="pg-empty">
                  <div className="pg-empty-icon">📦</div>
                  <p className="pg-empty-title">ไม่พบสินค้า</p>
                  <p className="pg-empty-sub">ลองเปลี่ยนคีย์เวิร์ดหรือหมวดหมู่อื่น</p>
                </div>
              ) : (
                products.map((product) => {
                  const displayPrice = Number(product.price || 0);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="pg-card"
                    >
                      <div className="pg-card-img-wrap">
                        <img
  src={product.images?.[0]?.imageUrl || "/no-image.jpg"}
  alt={product.name}
  className="pg-card-img"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
/>
                        {product.stock === 0 && (
                          <div className="pg-card-out-of-stock-overlay">
                            <span className="pg-card-out-badge">สินค้าหมด</span>
                          </div>
                        )}
                      </div>

                      <div className="pg-card-body">
                        <div className="pg-card-cat">
                          {product.category.parent
                            ? `${product.category.parent.name} › ${product.category.name}`
                            : product.category.name}
                        </div>

                        <p className="pg-card-name">{product.name}</p>

                        <div className="pg-card-code">{product.productCode}</div>

                        <div className="pg-card-footer">
                          <div className="pg-price">
                            <span className="pg-price-thb">฿</span>
                            {displayPrice.toLocaleString()}
                          </div>
                          {product.stock > 0 && (
                            <span className="pg-stock-ok">
                              เหลือ {product.stock} ชิ้น
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}