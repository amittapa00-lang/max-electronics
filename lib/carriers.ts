/**
 * หน้าเว็บติดตามพัสดุทางการของแต่ละขนส่ง
 * (ขนส่งส่วนใหญ่ไม่มีลิงก์ที่ใส่เลขพัสดุให้อัตโนมัติแบบเปิดเผย จึงลิงก์ไปหน้าติดตาม แล้วให้ลูกค้าวางเลขพัสดุเอง)
 */
const CARRIERS: { match: RegExp; name: string; url: string }[] = [
  { match: /flash/i, name: "Flash Express", url: "https://www.flashexpress.co.th/fle/tracking" },
  { match: /kerry|kex/i, name: "KEX Express (Kerry)", url: "https://th.kex-express.com/th/track/" },
  { match: /j\s*&\s*t|jt\s*express/i, name: "J&T Express", url: "https://www.jtexpress.co.th/service/track" },
  { match: /thailand\s*post|ไปรษณีย์|\bems\b/i, name: "ไปรษณีย์ไทย", url: "https://track.thailandpost.co.th/" },
  { match: /scg/i, name: "SCG Express", url: "https://www.scgexpress.co.th/tracking/" },
];

export function getCarrierTracking(company?: string | null): { name: string; url: string } | null {
  if (!company) return null;
  const c = CARRIERS.find((x) => x.match.test(company));
  return c ? { name: c.name, url: c.url } : null;
}
