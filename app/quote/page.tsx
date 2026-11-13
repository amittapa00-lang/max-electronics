import Link from "next/link";
import { CheckCircle2, Clock, FileText, Phone } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import { SHOP_PHONE, SHOP_PHONE_TEL } from "@/components/SocialIcons";

export const metadata = {
  title: "ขอใบเสนอราคา | MaxTech Electric",
  description: "แจ้งรุ่นและจำนวนสินค้าที่ต้องการ ทีมงาน MaxTech Electric จะส่งใบเสนอราคาให้โดยเร็ว",
};

const TIPS = [
  "ยี่ห้อและรุ่น (Model / Part No.) ของสินค้า",
  "จำนวนที่ต้องการแต่ละรายการ",
  "ถ้าไม่ทราบรุ่น บอกการใช้งานหรือรุ่นเดิมที่ใช้อยู่",
  "ต้องการใบกำกับภาษี เลือก “นิติบุคคล” แล้วกรอกเลขผู้เสียภาษี",
];

/** ขอใบเสนอราคาทั่วไป — สั่งหลายรายการ หรือหาสินค้าในเว็บไม่เจอ */
export default function GeneralQuotePage() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-700">
            หน้าหลัก
          </Link>
          <span className="mx-2">›</span>
          <span className="text-slate-700">ขอใบเสนอราคา</span>
        </nav>

        <div className="mb-8">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <FileText className="h-4 w-4" /> สำหรับฝ่ายจัดซื้อ / โรงงาน
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">ขอใบเสนอราคา</h1>
          <p className="mt-2 text-slate-600">
            สั่งจำนวนมาก หรือหาสินค้าในเว็บไม่เจอ แจ้งรุ่นและจำนวนที่ต้องการ ทีมงานจะส่งใบเสนอราคาให้ทางอีเมลโดยเร็ว
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <aside className="space-y-4 lg:order-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">ข้อมูลที่ช่วยให้ได้ราคาเร็วขึ้น</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {TIPS.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-600 p-6 text-white">
              <p className="inline-flex items-center gap-2 text-sm text-brand-100">
                <Clock className="h-4 w-4" /> จ.–ศ. 08:30–17:30 · ส. 09:00–12:00
              </p>
              <p className="mt-2 font-semibold">ต้องการราคาด่วน? โทรคุยกับฝ่ายขายได้เลย</p>
              <a
                href={SHOP_PHONE_TEL}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <Phone className="h-4 w-4" /> {SHOP_PHONE}
              </a>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-2 lg:order-1">
            <h2 className="mb-6 text-xl font-bold text-slate-900">ข้อมูลผู้ขอใบเสนอราคา</h2>
            <QuoteForm />
          </section>
        </div>
      </div>
    </main>
  );
}
