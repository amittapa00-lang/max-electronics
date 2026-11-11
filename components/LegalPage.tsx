import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SHOP_EMAIL, SHOP_LINE_ID, SHOP_LINE_URL, SHOP_PHONE, SHOP_PHONE_TEL } from "./SocialIcons";

export type LegalSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

/** โครงหน้าเอกสาร (นโยบายความเป็นส่วนตัว / ข้อกำหนดและเงื่อนไข) */
export default function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: React.ReactNode;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-1 text-xs text-slate-500" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700">{title}</span>
      </nav>

      <header className="mt-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">ปรับปรุงล่าสุด: {updated}</p>
        <div className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-700">{intro}</div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* สารบัญ */}
        <aside className="lg:sticky lg:top-36 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">หัวข้อ</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex gap-2 text-slate-600 hover:text-brand-700">
                  <span className="w-5 shrink-0 text-slate-400">{i + 1}.</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="min-w-0 space-y-8">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-40">
              <h2 className="flex gap-2 text-lg font-bold text-slate-900">
                <span className="text-brand-600">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700">{s.body}</div>
            </section>
          ))}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">ติดต่อร้าน MaxTech Electric</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>
                โทร: <a href={SHOP_PHONE_TEL} className="text-brand-700 hover:underline">{SHOP_PHONE}</a>
              </li>
              <li>
                LINE:{" "}
                <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                  {SHOP_LINE_ID}
                </a>
              </li>
              <li>
                อีเมล: <a href={`mailto:${SHOP_EMAIL}`} className="text-brand-700 hover:underline">{SHOP_EMAIL}</a>
              </li>
              <li>เว็บไซต์: www.maxtechelectric.com</li>
            </ul>
          </div>
        </article>
      </div>
    </main>
  );
}

/** รายการหัวข้อย่อยแบบจุด */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-brand-600">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
