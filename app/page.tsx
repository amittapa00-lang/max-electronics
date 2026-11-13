import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  FileText,
  Gauge,
  Headset,
  LayoutGrid,
  Lightbulb,
  Phone,
  RotateCcw,
  ShieldCheck,
  ToggleLeft,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import ProductCard, { type ProductBadge, type ProductCardData } from "@/components/ProductCard";
import { LineIcon, SHOP_LINE_URL, SHOP_PHONE, SHOP_PHONE_TEL } from "@/components/SocialIcons";

// ดึงข้อมูลสดทุกครั้ง (กันสินค้าที่ถูกลบแล้วค้างอยู่ที่หน้าแรก)
export const dynamic = "force-dynamic";

const productInclude = { category: { include: { parent: true } }, images: true } as const;

export default async function Home() {
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  const available = { OR: [{ quotationOnly: true }, { stock: { gt: 0 } }] };

  const [latestProducts, bestSellingProducts, recommendedProducts, readyProducts, categories] =
    await Promise.all([
      prisma.product.findMany({
        take: 10,
        where: { createdAt: { gte: twentyDaysAgo } },
        orderBy: { createdAt: "desc" },
        include: productInclude,
      }),
      prisma.product.findMany({
        take: 10,
        where: { sold: { gt: 0 }, ...available },
        orderBy: { sold: "desc" },
        include: productInclude,
      }),
      prisma.product.findMany({
        take: 10,
        where: { isRecommended: true, ...available },
        orderBy: { updatedAt: "desc" },
        include: productInclude,
      }),
      // สินค้าที่มีราคาและพร้อมส่ง — แสดงเสมอเพื่อให้หน้าแรกมีสินค้าให้เลือก
      prisma.product.findMany({
        take: 10,
        where: { quotationOnly: false, stock: { gt: 0 } },
        orderBy: { updatedAt: "desc" },
        include: productInclude,
      }),
      prisma.category.findMany({
        where: { parentId: null },
        include: {
          _count: { select: { products: true } },
          children: { include: { _count: { select: { products: true } } } },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    ]);

  const categoryTiles = categories
    .map((c) => ({
      name: c.name,
      count: c._count.products + c.children.reduce((s, ch) => s + ch._count.products, 0),
    }))
    .filter((c) => c.count > 0)
    .slice(0, 8);

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <Image
          src="/banner_red.png"
          alt="MaxTech Electric - แหล่งรวมอุปกรณ์ไฟฟ้าอุตสาหกรรม PLC Inverter Sensor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-12 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Max<span className="text-brand-600">Tech</span> Electric
              <span className="mt-2 block text-xl sm:text-2xl font-semibold text-brand-600">
                ศูนย์รวมอุปกรณ์ไฟฟ้าอุตสาหกรรม <span className="whitespace-nowrap">ครบวงจร</span>
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
              PLC, Sensor, Inverter, Breaker มือหนึ่ง มือสอง พร้อมวิศวกรให้คำปรึกษา
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-7 text-base font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-colors"
              >
                ดูสินค้าทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={SHOP_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 hover:border-brand-600 hover:text-brand-700 transition-colors"
              >
                <LineIcon className="h-5 w-5 text-[#06C755]" /> สอบถามราคา / สเปก
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── จุดเด่นร้าน ─── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {[
            { icon: BadgeCheck, title: "สินค้าแท้ 100%", sub: "คัดสรรจากตัวแทนจำหน่าย" },
            { icon: Truck, title: "จัดส่งทั่วประเทศ", sub: "ส่งภายใน 1–3 วันทำการ" },
            { icon: ShieldCheck, title: "รับประกันสินค้า", sub: "ใหม่ 3 เดือน · มือสอง 1 เดือน" },
            { icon: Headset, title: "ทีมงานผู้เชี่ยวชาญ", sub: "ให้คำปรึกษาด้านเทคนิค" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 px-3 sm:px-5 py-4 sm:py-5">
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                <p className="text-xs text-slate-500 truncate">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12 sm:space-y-14">
        {/* ─── หมวดหมู่สินค้า ─── */}
        {categoryTiles.length > 0 && (
          <section>
            <SectionHeader title="เลือกตามหมวดหมู่" subtitle="หาอุปกรณ์ที่ต้องการได้เร็วขึ้น" href="/products" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryTiles.map((c) => {
                const Icon = categoryIcon(c.name);
                return (
                  <Link
                    key={c.name}
                    href={`/products?category=${encodeURIComponent(c.name)}`}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{c.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{c.count} รายการ</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <ProductSection title="สินค้าแนะนำ" subtitle="คัดมาให้โดยทีมงาน" products={recommendedProducts} badge="recommended" />
        <ProductSection title="สินค้าขายดี" subtitle="ลูกค้าโรงงานสั่งซื้อบ่อย" products={bestSellingProducts} badge="bestseller" />
        <ProductSection title="สินค้ามาใหม่" subtitle="อัปเดตล่าสุดภายใน 20 วัน" products={latestProducts} badge="new" />
        <ProductSection title="สินค้าพร้อมส่ง" subtitle="มีของในสต็อก สั่งได้ทันที" products={readyProducts} />

        {/* ─── แบนเนอร์ขอใบเสนอราคา ─── */}
        <section className="overflow-hidden rounded-2xl bg-brand-600">
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="relative flex-1">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-100">
                <FileText className="h-4 w-4" /> สำหรับฝ่ายจัดซื้อ / โรงงาน
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">ต้องการสั่งจำนวนมาก หรือหาสินค้าไม่เจอ?</h2>
              <p className="mt-2 text-sm sm:text-base text-brand-100">
                แจ้งรุ่นและจำนวนที่ต้องการ ทีมงานจะส่งใบเสนอราคาให้โดยเร็ว
              </p>
            </div>
            <div className="relative flex flex-col sm:flex-row gap-3">
              <Link
                href="/quote"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <FileText className="h-4 w-4" /> ขอใบเสนอราคา
              </Link>
              <a
                href={SHOP_PHONE_TEL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Phone className="h-4 w-4" /> {SHOP_PHONE}
              </a>
            </div>
          </div>
        </section>

        {/* ─── นโยบายร้านค้า ─── */}
        <section>
          <SectionHeader title="ซื้อง่าย มั่นใจทุกขั้นตอน" subtitle="นโยบายของ MaxTech Electric" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PolicyCard icon={ShieldCheck} title="รับประกันสินค้า">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">สินค้าใหม่ 3 เดือน</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">มือสอง 1 เดือน</span>
              </div>
              <ul className="space-y-1.5">
                <li>ไม่รวมการใช้งานเกินสเปก</li>
                <li>ไม่รวมการดัดแปลง/ซ่อมเอง</li>
                <li>สติกเกอร์รับประกันต้องสมบูรณ์</li>
              </ul>
            </PolicyCard>
            <PolicyCard icon={RotateCcw} title="เปลี่ยน / คืนสินค้า">
              <ul className="space-y-1.5">
                <li>แจ้งเคลมได้ภายใน 30 วัน</li>
                <li>สินค้าและแพ็กเกจต้องอยู่ในสภาพเดิม</li>
                <li>คืนเงินเฉพาะค่าสินค้า ไม่รวมค่าส่ง</li>
                <li>ดำเนินการภายใน 7 วันทำการ</li>
              </ul>
            </PolicyCard>
            <PolicyCard icon={Truck} title="ค่าจัดส่ง">
              <p className="text-2xl font-bold text-slate-900">เริ่มต้น ฿50</p>
              <p className="mt-1">สำหรับ 1–2 ชิ้นแรก ชิ้นถัดไปเพิ่มชิ้นละ ฿50 จัดส่งทั่วประเทศ พร้อมเลขพัสดุติดตามได้ในหน้าคำสั่งซื้อ</p>
            </PolicyCard>
            <PolicyCard icon={Wrench} title="ข้อตกลงการสั่งซื้อ">
              <ul className="space-y-1.5">
                <li>ชำระเงินแล้วไม่สามารถยกเลิกได้</li>
                <li>จัดส่งแล้วไม่สามารถยกเลิกได้</li>
                <li>ไม่รับคืนกรณีสั่งผิดรุ่น/ผิดสเปก กรุณาตรวจสอบก่อนสั่งซื้อ</li>
              </ul>
            </PolicyCard>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─── Helpers ─── */

function categoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("plc") || n.includes("hmi")) return Cpu;
  if (n.includes("inverter") || n.includes("servo") || n.includes("motor")) return Gauge;
  if (n.includes("sensor") || n.includes("เซนเซอร์")) return Zap;
  if (n.includes("lamp") || n.includes("ไฟ")) return Lightbulb;
  if (n.includes("switch") || n.includes("สวิ") || n.includes("button")) return ToggleLeft;
  if (n.includes("breaker") || n.includes("เบรก")) return ShieldCheck;
  if (n.includes("truck") || n.includes("lift") || n.includes("รถ")) return Truck;
  return LayoutGrid;
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-slate-900">
          <span className="h-6 w-1.5 rounded-full bg-brand-600" />
          {title}
        </h2>
        {subtitle && <p className="mt-1 pl-4 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          ดูทั้งหมด <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  badge,
}: {
  title: string;
  subtitle: string;
  products: ProductCardData[];
  badge?: ProductBadge;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} href="/products" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>
    </section>
  );
}

function PolicyCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}
