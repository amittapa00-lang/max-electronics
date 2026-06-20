import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  // ดึงข้อมูลจริงโดยอิงจากความสัมพันธ์ใน schema.prisma
  const [latestProducts, bestSellingProducts, recommendedProducts] = await Promise.all([
    // 1. สินค้าล่าสุด: เรียงตามเวลาที่เพิ่มจริง
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: true },
    }),
    
    // 2. สินค้าขายดี: นับจำนวนแถวที่ถูกสั่งซื้อใน OrderItem จากมากไปน้อย
    prisma.product.findMany({
      take: 8,
      where: {
        stock: { gt: 0 },
        orderItems: { some: {} }
      },
      orderBy: {
        orderItems: { _count: "desc" },
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
    <main className="bg-slate-50/50 min-h-screen font-sans">

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative w-full min-h-125 lg:min-h-137.5 overflow-hidden flex items-center bg-slate-950 py-10 lg:py-0">
        <Image 
          src="/banner_.png" 
          alt="MaxTech Electric Banner" 
          fill 
          priority 
          className="object-cover object-center opacity-40 lg:opacity-60" 
          sizes="100vw" 
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 lg:to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* โซนซ้าย: สโลแกนหลักและปุ่มแอคชัน */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-block bg-blue-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 shadow-md">
              Industrial Electronics &amp; Automation
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
              MaxTech Electric
            </h1>
            <p className="text-rose-400 text-sm sm:text-lg font-bold mb-4 leading-snug">
              จำหน่ายอุปกรณ์ไฟฟ้า อิเล็กทรอนิกส์ ออโตเมชั่น มือหนึ่ง มือสอง ทุกชนิด
            </p>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed mb-6 hidden sm:block">
              ศูนย์รวมอุปกรณ์ควบคุมโรงงานอุตสาหกรรมประสิทธิภาพสูง สินค้าผ่านการคัดสรรและตรวจสอบมาตรฐาน พร้อมทีมงานวิศวกรให้คำแนะนำด้านเทคนิค
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-98">
                ดูสินค้าทั้งหมด
              </Link>
              <Link 
                href="/contact" 
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-medium px-6 py-2.5 rounded-xl backdrop-blur-xs transition-all inline-flex items-center gap-2"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>

          {/* โซนขวา: กล่องข้อมูลติดต่อด่วน + ป้ายหมวดหมู่สินค้า */}
          <div className="lg:col-span-5 bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl space-y-4">
            
            {/* รายละเอียดช่องทางติดต่อ */}
            <div className="flex gap-4 items-center bg-white/5 rounded-xl p-3 border border-white/5">
              {/* LINE QR Code */}
              <div className="flex flex-col items-center shrink-0 bg-white p-1.5 rounded-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded">
                  <Image src="/line-qr.jpg" alt="LINE QR Code" fill className="object-cover" />
                </div>
                <span className="bg-[#22c55e] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1">LINE ID</span>
              </div>
              
              {/* ข้อมูลการติดต่อทั้งหมดแบบคลิกได้จริง */}
              <div className="text-white text-xs space-y-2.5 w-full overflow-hidden">
                <p className="font-bold text-blue-400 text-[10px] tracking-wider uppercase pl-0.5">Contact Center</p>
                
                {/* 1. เบอร์โทร */}
                <a href="tel:0946861981" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                  <span className="text-slate-400 text-sm w-4 text-center group-hover:scale-110 transition-transform">📞</span> 
                  <span className="font-medium text-slate-200 group-hover:text-blue-400 truncate">094-686-1981</span>
                </a>
                
                {/* 2. LINE */}
                <a href="https://line.me/ti/p/~@051pdsfe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#22c55e] transition-colors group">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="#22c55e" className="w-full h-full">
                      <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738s-12 4.369-12 9.738c0 4.814 4.269 8.846 10.036 9.564.39.084.922.258 1.057.592.12.313.079.803.039 1.121l-.171 1.027c-.052.31-.241 1.217 1.042.665 1.284-.553 6.923-4.077 9.441-6.976 1.733-1.859 2.556-3.896 2.556-6.013zm-16.945 3.328c0 .225-.183.407-.407.407h-1.341c-.225 0-.407-.182-.407-.407v-3.725c0-.225.182-.407.407-.407.225 0 .407.182.407.407v3.318h1.341c.224 0 .407.182.407.407zm2.254 0c0 .225-.183.407-.408.407h-.001c-.225 0-.407-.182-.407-.407v-3.725c0-.225.182-.407.407-.407.225 0 .408.182.408.407v3.725zm3.824 0c0 .167-.101.318-.255.381-.05.021-.102.031-.153.031-.109 0-.214-.044-.29-.124l-1.637-1.722v1.432c0 .225-.182.407-.407.407s-.407-.182-.407-.407v-3.725c0-.167.101-.318.255-.381.154-.063.332-.027.449.091l1.625 1.708v-1.417c0-.225.182-.407.407-.407s.407.182.407.407v3.725zm2.973-1.124c0 .225-.183.407-.407.407h-1.353v.717h1.353c.225 0 .407.182.407.407 0 .225-.182.407-.407.407h-1.761c-.224 0-.407-.182-.407-.407v-3.725c0-.225.183-.407.407-.407h1.761c.225 0 .407.182.407.407 0 .225-.182.407-.407.407h-1.353v.673h1.353c.225 0 .407.182.407.407z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-slate-200 group-hover:text-[#22c55e]">@051pdsfe</span>
                </a>
                
                {/* 3. Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61591176506538"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#1877f2] transition-colors group"
                >
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="#1877f2" className="w-full h-full">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-slate-200 group-hover:text-[#1877f2] truncate">
                    MaxTech Electric
                  </span>
                </a>

                {/* 4. อีเมล */}
                <a href="mailto:maxtechelectric1@gmail.com" className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-rose-400 transition-colors group">
                  <span className="text-xs w-4 text-center group-hover:scale-110 transition-transform">✉️</span>
                  <span className="truncate group-hover:text-rose-400">maxtechelectric1@gmail.com</span>
                </a>
              </div>
            </div>

            {/* เบอร์โทรศัพท์ฝ่ายเทคนิคเฉพาะทาง */}
            <a href="tel:0946861981" className="block bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl px-3 py-1.5 transition-colors">
              <div className="flex items-center gap-2 text-[11px] font-medium text-amber-300">
                <span>🔧</span> 
                <span>ปรึกษาข้อมูลทางเทคนิค: 094-686-1981</span>
              </div>
            </a>

            {/* แถบหมวดหมู่สินค้า 6 สี */}
            <div className="space-y-2">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest pl-1">Main Categories</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { title: "PLC", color: "from-orange-500 to-orange-600" },
                  { title: "Inverter", color: "from-amber-400 to-amber-500" },
                  { title: "SERVO", color: "from-emerald-500 to-emerald-600" },
                  { title: "MOTOR", color: "from-red-500 to-red-600" },
                  { title: "SENSOR", color: "from-purple-500 to-purple-600" },
                  { title: "สายลิงค์/โหลด", color: "from-blue-600 to-indigo-600" },
                ].map((item) => (
                  <div 
                    key={item.title} 
                    className={`bg-linear-to-r ${item.color} text-white font-black text-center text-[10px] sm:text-xs py-2 rounded-lg shadow-xs border-b-2 border-black/20 select-none`}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 2. FEATURE STRIP ─── */}
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

      {/* ─── 3. โซนสินค้าสไลด์แนวนอน ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* สินค้าแนะนำ */}
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

        {/* สินค้าขายดี */}
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
          <div className="hidden" />
        )}

        {/* สินค้าล่าสุด */}
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

      {/* ─── 4. นโยบายร้านค้า ─── */}
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
                href="https://line.me/ti/p/~@051pdsfe"
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

      {/* ─── 5. FOOTER ─── */}
     {/* ─── 5. FOOTER (Updated with clickable links) ─── */}
<footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
    
    {/* Col 1: ข้อมูลบริษัท */}
    <div className="space-y-4">
      <h3 className="text-white font-black text-lg tracking-tight">MaxTech Electric</h3>
      <p className="text-xs leading-relaxed text-slate-500">
        ผู้นำด้านอุปกรณ์อิเล็กทรอนิกส์และออโตเมชันอุตสาหกรรมครบวงจร คัดสรรสินค้าคุณภาพเพื่อประสิทธิภาพสูงสุดในโรงงานของคุณ
      </p>
      <div className="flex gap-4">
        <a 
          href="https://www.facebook.com/profile.php?id=61591176506538" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition-colors"
        >
          Facebook
        </a>
        <a 
          href="https://line.me/ti/p/~@051pdsfe" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-green-500 transition-colors"
        >
          LINE
        </a>
      </div>
    </div>

    {/* Col 2: ลิงก์ด่วน */}
    <div>
      <h4 className="text-white font-bold text-sm mb-4">บริการและช่วยเหลือ</h4>
      <ul className="space-y-2.5 text-xs">
        <li><Link href="/products" className="hover:text-white transition-colors">สินค้าทั้งหมด</Link></li>
        <li><Link href="/contact" className="hover:text-white transition-colors">แจ้งปัญหาการใช้งาน</Link></li>
        <li><Link href="/about" className="hover:text-white transition-colors">เกี่ยวกับเรา</Link></li>
        <li><Link href="/contact" className="hover:text-white transition-colors">ติดต่อเรา</Link></li>
      </ul>
    </div>

    {/* Col 3: ติดต่อเรา */}
    <div>
      <h4 className="text-white font-bold text-sm mb-4">ติดต่อเรา</h4>
      <ul className="space-y-3 text-xs text-slate-400">
        <li className="flex items-center gap-2">
          <span>📞</span> <a href="tel:0946861981" className="hover:text-white transition-colors">094-686-1981</a>
        </li>
        <li className="flex items-center gap-2">
          <span>✉️</span> <a href="mailto:maxtechelectric1@gmail.com" className="hover:text-white transition-colors">maxtechelectric1@gmail.com</a>
        </li>
        <li className="flex items-center gap-2">
          <span>📍</span> สมุทรปราการ, ประเทศไทย
        </li>
      </ul>
    </div>

    {/* Col 4: เวลาทำการ */}
    <div>
      <h4 className="text-white font-bold text-sm mb-4">เวลาทำการ</h4>
      <p className="text-xs text-slate-500">
        จันทร์ - ศุกร์: 08:30 - 17:30 น.<br />
        เสาร์: 09:00 - 12:00 น.<br />
        <span className="text-rose-500 italic mt-2 block">*หยุดวันอาทิตย์และวันหยุดนักขัตฤกษ์</span>
      </p>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600">
    <p>© {new Date().getFullYear()} MaxTech Electric. All rights reserved.</p>
    <div className="flex gap-6">
      <Link href="/privacy" className="hover:text-slate-400">นโยบายความเป็นส่วนตัว</Link>
      <Link href="/terms" className="hover:text-slate-400">เงื่อนไขการใช้บริการ</Link>
    </div>
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