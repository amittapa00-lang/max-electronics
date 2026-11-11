"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LineIcon,
  SHOP_EMAIL,
  SHOP_FACEBOOK_URL,
  SHOP_INSTAGRAM_URL,
  SHOP_LINE_ID,
  SHOP_LINE_URL,
  SHOP_PHONE,
  SHOP_PHONE_TEL,
} from "./SocialIcons";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 bg-slate-950 text-slate-400">
      <div className="h-1 bg-brand-600" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white p-1.5">
              <Image src="/LOGO_MaxTech.png" alt="MaxTech Electric" width={60} height={40} className="h-8 w-auto" />
            </span>
            <span className="text-white font-bold text-lg">MaxTech Electric</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            จำหน่ายอุปกรณ์ไฟฟ้าอุตสาหกรรมและระบบอัตโนมัติ PLC, Sensor, Inverter, Breaker
            สวิตช์และไฟสัญญาณ พร้อมทีมงานให้คำปรึกษาด้านเทคนิค
          </p>
          <div className="flex gap-2">
            <a href={SHOP_FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-[#1877f2] hover:text-white transition-colors">
              <FacebookIcon />
            </a>
            <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" aria-label="LINE"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-[#06C755] hover:text-white transition-colors">
              <LineIcon />
            </a>
            <a href={SHOP_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-[#E4405F] hover:text-white transition-colors">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">เมนู</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="hover:text-white transition-colors">สินค้าทั้งหมด</Link></li>
            <li><Link href="/orders" className="hover:text-white transition-colors">ติดตามคำสั่งซื้อ</Link></li>
            <li><Link href="/problem" className="hover:text-white transition-colors">แจ้งปัญหาการใช้งาน</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">ติดต่อเรา</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">ติดต่อเรา</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={SHOP_PHONE_TEL} className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-brand-500" /> {SHOP_PHONE}
              </a>
            </li>
            <li>
              <a href={SHOP_LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <LineIcon className="h-4 w-4 text-[#06C755]" /> LINE {SHOP_LINE_ID}
              </a>
            </li>
            <li>
              <a href={`mailto:${SHOP_EMAIL}`} className="flex items-center gap-2.5 hover:text-white transition-colors break-all">
                <Mail className="h-4 w-4 shrink-0 text-brand-500" /> {SHOP_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-brand-500" /> สมุทรปราการ, ประเทศไทย
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">เวลาทำการ</h4>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 mt-0.5 text-brand-500" />
              <span>
                จันทร์–ศุกร์ 08:30–17:30 น.<br />
                เสาร์ 09:00–12:00 น.
              </span>
            </p>
            <p className="text-xs text-slate-500 pl-6.5">หยุดวันอาทิตย์และวันหยุดนักขัตฤกษ์</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} MaxTech Electric · www.maxtechelectric.com</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms" className="hover:text-white transition-colors">ข้อกำหนดและเงื่อนไข</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
