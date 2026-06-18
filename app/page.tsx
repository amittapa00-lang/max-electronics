import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  // ดึงข้อมูลจริงโดยอิงจากความสัมพันธ์ใน schema.prisma ของคุณ
  const [latestProducts, bestSellingProducts, recommendedProducts] = await Promise.all([
    // 1. สินค้าล่าสุด: เรียงตามเวลาที่เพิ่มจริง
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: true },
    }),
    
    // 2. สินค้าขายดี (REAL DATA): นับจำนวนแถวที่ถูกสั่งซื้อใน OrderItem จากมากไปน้อย
    // สินค้าตัวไหนที่ยอดขายเป็น 0 (เช่น เพิ่งเพิ่มใหม่/ยังไม่มีคนซื้อ) จะไม่ขึ้นอันดับแรกแน่นอน
    prisma.product.findMany({
      take: 8,
      where: {
        stock: { gt: 0 },
        orderItems: {
          some: {} // กรองเฉพาะสินค้าที่เคยถูกสั่งซื้อจริงอย่างน้อย 1 ครั้ง
        }
      },
      orderBy: {
        orderItems: {
          _count: "desc", // เรียงตามจำนวนครั้งที่เกิดการสั่งซื้อจริง
        },
      },
      include: { category: true, images: true },
    }),

    // 3. สินค้าแนะนำ: คัดจากกลุ่มสินค้าพรีเมียมราคาดีของร้าน
    prisma.product.findMany({
      take: 8,
      where: { stock: { gt: 0 } },
      orderBy: { price: "desc" }, 
      include: { category: true, images: true },
    }),
  ]);

  return (
    <main className="bg-slate-50/50 min-h-screen">

      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-110 overflow-hidden flex items-center bg-slate-950">
        <Image 
          src="/banner_.png" 
          alt="MaxTech Electric Banner" 
          fill 
          priority 
          className="object-cover object-center opacity-75" 
          sizes="100vw" 
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <span className="inline-block bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
            Industrial Electronics &amp; Automation
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
            MaxTech Electric
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            จำหน่ายอุปกรณ์อิเล็กทรอนิกส์ ออโตเมชันอุตสาหกรรม PLC, Inverter, HMI, Servo Motor และอุปกรณ์ควบคุมโรงงานครบวงจร
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-150 active:scale-98">
              ดูสินค้าทั้งหมด
            </Link>
            <Link href="/contact" className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-medium px-6 py-2.5 rounded-xl backdrop-blur-xs transition-all duration-150">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Feature Strip ─── */}
      <section className="bg-slate-900 border-y border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-x-12 gap-y-2">
          {[
            { icon: "⚡", label: "จัดส่งทั่วประเทศ" },
            { icon: "🛡️", label: "สินค้ารับประกัน" },
            { icon: "📞", label: "ทีมงานผู้เชี่ยวชาญ" },
            { icon: "🔧", label: "บริการหลังการขาย" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-slate-300 text-xs font-medium">
              <span className="text-sm">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* ─── โซนสินค้าสไลด์แนวนอน ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* 1. สินค้าแนะนำ */}
        {recommendedProducts.length > 0 && (
          <section>
            <SectionHeader eyebrow="Editor's Pick" title="สินค้าแนะนำ" href="/products" />
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar">
              {recommendedProducts.map((p) => (
                <div key={p.id} className="w-50 sm:w-60 shrink-0 snap-start">
                  <ProductCard 
                    product={p} 
                    badge={{ label: "แนะนำ", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. สินค้าขายดี (จะแสดงก็ต่อเมื่อมียอดสั่งซื้อจริงในระบบเท่านั้น) */}
        {bestSellingProducts.length > 0 ? (
          <section>
            <SectionHeader eyebrow="Best Value" title="สินค้าขายดี" href="/products" />
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar">
              {bestSellingProducts.map((p) => (
                <div key={p.id} className="w-50 sm:w-60 shrink-0 snap-start">
                  <ProductCard 
                    product={p} 
                    badge={{ label: "ขายดี", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }} 
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* กรณีที่เว็บเพิ่งเปิดใหม่ ยังไม่มีใครซื้อของเลย ให้แสดงข้อความแจ้ง หรือซ่อนเซกชันนี้ไปก่อนแบบเนียนๆ ครับ */
          <div className="hidden" />
        )}

        {/* 3. สินค้าล่าสุด */}
        {latestProducts.length > 0 && (
          <section>
            <SectionHeader eyebrow="New Arrivals" title="สินค้าล่าสุด" href="/products" />
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar">
              {latestProducts.map((p) => (
                <div key={p.id} className="w-50 sm:w-60 shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─── นโยบายร้านค้า ─── */}
      <section className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">นโยบายของเรา</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">ซื้อง่าย มั่นใจทุกขั้นตอน</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">เปลี่ยน / คืนสินค้า</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500 list-disc list-inside leading-relaxed">
                <li>แจ้งเคลมได้ภายใน 30 วัน หลังได้รับสินค้า</li>
                <li>สินค้าและแพ็กเกจต้องอยู่ในสภาพเดิม</li>
                <li>ลูกค้ารับผิดชอบค่าจัดส่งสินค้าคืน</li>
                <li>คืนเงินเฉพาะค่าสินค้า ไม่รวมค่าจัดส่ง</li>
                <li>ดำเนินการภายใน 7 วันทำการ</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <div className="text-3xl mb-4">📌</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">ข้อตกลงการสั่งซื้อ</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500 list-disc list-inside leading-relaxed">
                <li>คำสั่งซื้อที่ชำระเงินแล้ว ไม่สามารถยกเลิกได้</li>
                <li>หากจัดส่งแล้ว ไม่สามารถยกเลิกคำสั่งซื้อได้</li>
                <li>ร้านไม่รับผิดชอบความเสียหายจากการใช้งานผิดวิธี</li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-base font-bold text-emerald-900 mb-3">รับประกันสินค้า</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">สินค้าใหม่ 3 เดือน</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">สินค้ามือสอง 1 เดือน</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-800/80 list-disc list-inside leading-relaxed">
                <li>ไม่รวมกรณีใช้งานเกินสเปก</li>
                <li>ไม่รวมการดัดแปลงหรือซ่อมแซมเอง</li>
                <li>ไม่รวมความเสียหายจากภัยธรรมชาติ</li>
                <li>สติ๊กเกอร์รับประกันต้องสมบูรณ์</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">ค่าจัดส่งสินค้า</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                1–2 ชิ้นแรก 100 บาท ชิ้นถัดไปเพิ่มชิ้นละ 50 บาท จัดส่งปลอดภัยและรวดเร็วทั่วประเทศไทย
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">ติดตามพัสดุ</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                ตรวจสอบสถานะคำสั่งซื้อและเลขพัสดุผ่านทางระบบหน้าเว็บไซต์ได้ทันทีหลังร้านค้าจัดส่งสินค้า
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">ศูนย์ช่วยเหลือ</h3>
                <p className="text-xs sm:text-sm text-emerald-800/80 leading-relaxed mb-4">
                  สอบถามข้อมูลเพิ่มเติมเกี่ยวกับสเปกสินค้า หรือปัญหาการใช้งาน ติดต่อเราได้ตลอดเวลา
                </p>
              </div>
              <a
                href="https://line.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors w-fit"
              >
                💬 แชทกับเราใน LINE
              </a>
            </div>
          </div>

          <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 items-start">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-sm font-bold text-red-800 mb-1">ข้อสงวนสิทธิ์สำคัญ</h3>
              <p className="text-xs sm:text-sm text-red-700/90 leading-relaxed">
                ทางร้านไม่รับเปลี่ยน คืน หรือคืนเงินสินค้าในกรณีที่ลูกค้าสั่งซื้อผิดรุ่น ผิดสเปก หรือผิดประเภทสินค้า กรุณาตรวจสอบรายละเอียดสินค้าให้ถี่ถ้วนก่อนยืนยันรายการสั่งซื้อทุกครั้ง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <p className="text-sm font-bold text-white mb-2">MaxTech Electric</p>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            จำหน่ายอุปกรณ์อิเล็กทรอนิกส์และออโตเมชันอุตสาหกรรมครบวงจร
          </p>
        </div>
      </footer>

    </main>
  );
}

/* ─── Shared Types ─── */
type ProductWithRelations = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: { name: string } | null;
  images: { imageUrl: string }[];
};

/* ─── SectionHeader Component ─── */
function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-4">
      <div>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">{eyebrow}</p>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{title}</h2>
      </div>
      <Link href={href} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1 rounded-lg transition-all duration-150">
        ดูทั้งหมด →
      </Link>
    </div>
  );
}

/* ─── ProductCard Component ─── */
function ProductCard({
  product,
  badge,
}: {
  product: ProductWithRelations;
  badge?: { label: string; bg: string; text: string; border: string };
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-xs hover:shadow-lg hover:border-slate-200/60 transition-all duration-300 h-full"
    >
      <div className="relative w-full aspect-4/3 bg-slate-50 overflow-hidden">
        <Image
          src={product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border} shadow-2xs`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            {product.category?.name || "ทั่วไป"}
          </p>
          <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 min-h-8 leading-snug mb-2 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex justify-between items-center border-t border-slate-50 pt-2.5 mt-auto">
          <p className="text-sm sm:text-base font-black text-slate-900">
            <span className="text-[10px] font-medium mr-0.5">฿</span>
            {product.price.toLocaleString()}
          </p>
          
          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
            product.stock > 0 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : "bg-rose-50 text-rose-600 border-rose-100"
          }`}>
            {product.stock > 0 ? `คลัง: ${product.stock}` : "หมด"}
          </span>
        </div>
      </div>
    </Link>
  );
}