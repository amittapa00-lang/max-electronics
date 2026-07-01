import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QuoteForm from "@/components/QuoteStatus"; // ตรวจสอบให้แน่ใจว่าได้สร้าง Component นี้ไว้แล้ว

export default async function QuoteRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ดึงข้อมูลสินค้าจาก Database
  const product = await prisma.product.findUnique({
  where: {
    id: Number(id),
  },
  include: {
    category: true,
    images: true,
  },
});

  if (!product) notFound();

  return (
    <div className="pdp-root pdp-wrapper" style={{ padding: "40px 24px", minHeight: "100vh", backgroundColor: "#FAFAF8" }}>
      
      {/* Breadcrumb แบบเดียวกับหน้า PDP */}
      <nav className="pdp-breadcrumb" style={{ maxWidth: "1120px", margin: "0 auto 20px" }}>
        <Link href="/">หน้าหลัก</Link>
        <span className="pdp-breadcrumb-sep" style={{ margin: "0 8px" }}>›</span>
        <Link href={`/products/${product.slug}`}>กลับไปที่สินค้า</Link>
        <span className="pdp-breadcrumb-sep" style={{ margin: "0 8px" }}>›</span>
        <span className="pdp-breadcrumb-current">ขอใบเสนอราคา</span>
      </nav>

      {/* Main Grid: แบ่ง 2 คอลัมน์เหมือน PDP */}
      <div className="pdp-grid" style={{ 
        maxWidth: "1120px", 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "56px" 
      }}>

        {/* Column 1: ข้อมูลสรุปสินค้า */}
        <div className="pdp-info">
          <div style={{ padding: "32px", background: "#fff", borderRadius: "20px", border: "1px solid #E4E2DE", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <span className="pdp-category">{product.category.name}</span>
            <h1 className="pdp-name" style={{ fontSize: "28px", marginTop: "12px" }}>{product.name}</h1>
           {product.images.length > 0 ? (
  <Image
    src={product.images[0].imageUrl}
    alt={product.name}
    width={600}
    height={600}
    className="w-full rounded-xl border mb-5 object-cover"
  />
) : (
  <div className="w-full h-80 rounded-xl border flex items-center justify-center bg-slate-100 text-slate-400">
    ไม่มีรูปสินค้า
  </div>
)}
            <p className="pdp-code">
  SKU : {product.productCode || "-"}
</p>
            {product.quotationOnly ? (

  <div className="mt-4 text-2xl font-bold text-blue-600">
    📄 ขอใบเสนอราคา
  </div>

) : (

  <div className="mt-4 text-3xl font-bold text-red-600">
    ฿ {product.price.toLocaleString()}
  </div>

)}
            
            <hr className="pdp-divider" style={{ margin: "20px 0" }} />
            
            <p style={{ color: "#6B6B6B", fontSize: "14px", lineHeight: "1.6" }}>
              กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้ทีมงานฝ่ายขายของ MAX Electronics ดำเนินการออกใบเสนอราคาให้ท่านโดยเร็วที่สุด
            </p>
          </div>
        </div>

        {/* Column 2: ฟอร์มขอใบเสนอราคา */}
        <div className="pdp-form-wrapper" style={{ 
          padding: "32px", 
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid #E4E2DE", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)" 
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>ข้อมูลผู้ขอใบเสนอราคา</h2>
          <QuoteForm
  productId={product.id}
  productName={product.name}
  productCode={product.productCode ?? ""}
/>
        </div>

      </div>
    </div>
  );
}