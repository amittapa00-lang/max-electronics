import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "./ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true },
  });

  if (!product) notFound();

  return (
    <>
      <style>{`
        .pdp-root {
          --color-bg: #FAFAF8;
          --color-surface: #F2F0EC;
          --color-border: #E4E2DE;
          --color-ink: #1A1A1A;
          --color-muted: #6B6B6B;
          --color-accent: #C8922A;
          --color-accent-light: #FDF4E7;
          --color-success: #1E7A4A;
          --color-success-bg: #E8F5EE;
          --color-danger: #B33A3A;
          --color-danger-bg: #FAEAEA;
          --radius-sm: 6px;
          --radius-md: 12px;
          --radius-lg: 20px;
          --shadow-card: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          --shadow-btn: 0 4px 14px rgba(200,146,42,0.35);
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        }

        .pdp-wrapper {
          min-height: 100vh;
          background: var(--color-bg);
          padding: 0 0 80px;
        }

        /* ── Breadcrumb ── */
        .pdp-breadcrumb {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 24px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--color-muted);
        }
        .pdp-breadcrumb a {
          color: var(--color-muted);
          text-decoration: none;
          transition: color .15s;
        }
        .pdp-breadcrumb a:hover { color: var(--color-ink); }
        .pdp-breadcrumb-sep { opacity: .4; }
        .pdp-breadcrumb-current { color: var(--color-ink); font-weight: 500; }

        /* ── Grid ── */
        .pdp-grid {
          max-width: 1120px;
          margin: 28px auto 0;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── Gallery column ── */
        .pdp-gallery-col {
          position: sticky;
          top: 24px;
        }

        /* ── Info column ── */
        .pdp-info {
          padding-top: 4px;
        }

        /* Category badge */
        .pdp-category {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-accent-light);
          color: var(--color-accent);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid rgba(200,146,42,.2);
        }

        /* Product name */
        .pdp-name {
          margin: 14px 0 0;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 700;
          color: var(--color-ink);
          line-height: 1.2;
          letter-spacing: -.02em;
        }

        /* Product code */
        .pdp-code {
          margin-top: 8px;
          font-size: 13px;
          color: var(--color-muted);
          font-family: 'SF Mono', 'Fira Code', monospace;
          letter-spacing: .03em;
        }

        /* Divider */
        .pdp-divider {
          margin: 20px 0;
          border: none;
          border-top: 1px solid var(--color-border);
        }

        /* Description */
        .pdp-description {
          font-size: 15px;
          color: #4A4A4A;
          line-height: 1.75;
        }

        /* Price block */
        .pdp-price-block {
          margin-top: 24px;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .pdp-price-currency {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-accent);
          margin-bottom: 4px;
        }
        .pdp-price-value {
          font-size: 44px;
          font-weight: 800;
          color: var(--color-accent);
          letter-spacing: -.03em;
          line-height: 1;
        }

        /* Stock badge */
        .pdp-stock {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .pdp-stock.in-stock {
          background: var(--color-success-bg);
          color: var(--color-success);
        }
        .pdp-stock.out-stock {
          background: var(--color-danger-bg);
          color: var(--color-danger);
        }
        .pdp-stock-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        /* CTA area */
        .pdp-cta {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Add to cart wrapper — let the component inside stay unstyled */
        .pdp-atc-wrapper button,
        .pdp-atc-wrapper a {
          width: 100%;
          padding: 16px 28px;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 700;
          background: var(--color-ink);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: background .2s, transform .15s;
          letter-spacing: .01em;
        }
        .pdp-atc-wrapper button:hover,
        .pdp-atc-wrapper a:hover {
          background: #333;
          transform: translateY(-1px);
        }
        .pdp-atc-wrapper button:active,
        .pdp-atc-wrapper a:active {
          transform: translateY(0);
        }

        .pdp-btn-soldout {
          width: 100%;
          padding: 16px 28px;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 700;
          background: var(--color-surface);
          color: var(--color-muted);
          border: 1.5px solid var(--color-border);
          cursor: not-allowed;
          letter-spacing: .01em;
        }

        /* Shipping note */
        .pdp-shipping-note {
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--color-muted);
        }
        .pdp-shipping-note svg {
          flex-shrink: 0;
          opacity: .6;
        }

        /* Meta info row */
        .pdp-meta-row {
          margin-top: 28px;
          padding: 16px;
          background: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .pdp-meta-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .pdp-meta-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .pdp-meta-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink);
        }
      `}</style>

      <div className="pdp-root pdp-wrapper">

        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb" aria-label="breadcrumb">
          <Link href="/">หน้าหลัก</Link>
          <span className="pdp-breadcrumb-sep">›</span>
          <Link href="/products">สินค้าทั้งหมด</Link>
          <span className="pdp-breadcrumb-sep">›</span>
          <Link href={`/category/${product.category.name}`}>{product.category.name}</Link>
          <span className="pdp-breadcrumb-sep">›</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="pdp-grid">

          {/* Left — Gallery */}
          <div className="pdp-gallery-col">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right — Info */}
          <div className="pdp-info">
            <span className="pdp-category">{product.category.name}</span>

            <h1 className="pdp-name">{product.name}</h1>

            <p className="pdp-code">SKU : {product.productCode}</p>

            <hr className="pdp-divider" />

            <p className="pdp-description">{product.description}</p>

            {/* Price */}
{product.quotationOnly ? (
  <div className="pdp-price-block">
    <span
      className="pdp-price-value"
      style={{ color: "#2563EB", fontSize: "30px" }}
    >
      📄 ขอใบเสนอราคา
    </span>
  </div>
) : (
  <div className="pdp-price-block">
    <span className="pdp-price-currency">฿</span>
    <span className="pdp-price-value">
      {product.price.toLocaleString()}
    </span>
  </div>
)}

            {/* Stock */}
            {product.stock > 0 ? (
              <span className="pdp-stock in-stock">
                <span className="pdp-stock-dot" />
                มีสินค้า · เหลือ {product.stock} ชิ้น
              </span>
            ) : (
              <span className="pdp-stock out-stock">
                <span className="pdp-stock-dot" />
                สินค้าหมด
              </span>
            )}

            {/* CTA */}
            {/* CTA */}
<div className="pdp-cta">

  {product.quotationOnly ? (

    <Link href={`/quote/${product.id}`}>
      <button
        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
      >
        📄 ขอใบเสนอราคา
      </button>
    </Link>

  ) : product.stock > 0 ? (

    <>
      <div className="pdp-atc-wrapper">
        <AddToCartButton productId={product.id} />
      </div>

      <p className="pdp-shipping-note">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="15" height="13" rx="1"/>
          <path d="M16 8h4l3 5v3h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>

        จัดส่งภายใน 1–3 วันทำการ
      </p>
    </>

  ) : (

    <button
      disabled
      className="pdp-btn-soldout"
    >
      สินค้าหมดชั่วคราว
    </button>

  )}

</div>

            {/* Meta */}
            <div className="pdp-meta-row">
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">หมวดหมู่</span>
                <span className="pdp-meta-value">{product.category.name}</span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">รหัสสินค้า</span>
                <span className="pdp-meta-value">{product.productCode}</span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">สถานะ</span>
                <span className="pdp-meta-value">
                  {product.stock > 0 ? "พร้อมจัดส่ง" : "สินค้าหมด"}
                </span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">คงเหลือ</span>
                <span className="pdp-meta-value">{product.stock} ชิ้น</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}