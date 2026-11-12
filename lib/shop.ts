/** ข้อมูลร้านสำหรับเอกสารที่พิมพ์ออก (ใบปะหน้า ฯลฯ) */
export const SHOP_SENDER = {
  name: "MaxTech Electric",
  phone: "094-686-1981",
  address: "ถนนท้ายบ้าน ตำบลท้ายบ้าน อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ 10280",
  website: "www.maxtechelectric.com",
};

/** 0812345678 → 081-234-5678 (รูปแบบอื่นคืนค่าเดิม) */
export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return raw;
}

/** รหัสไปรษณีย์ 5 หลักตัวสุดท้ายในที่อยู่ */
export function postalCodeOf(address: string) {
  const all = address.match(/(?<!\d)\d{5}(?!\d)/g);
  return all ? all[all.length - 1] : null;
}
