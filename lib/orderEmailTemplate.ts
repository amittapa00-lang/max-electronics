import { getCarrierTracking } from "./carriers";

/** เทมเพลตอีเมลแจ้งสถานะคำสั่งซื้อ (ไม่มี dependency เพื่อให้ทดสอบ/พรีวิวได้ง่าย) */

const SITE_URL = (process.env.SITE_URL || "https://www.maxtechelectric.com").replace(/\/$/, "");
const SHOP_PHONE = "094-686-1981";
const SHOP_LINE_ID = "@067rvfqe";
const SHOP_LINE_URL = "https://line.me/R/ti/p/@067rvfqe";

export type EmailOrder = {
  id: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  shippingCompany: string | null;
  trackingNumber: string | null;
  items: { price: number; quantity: number; product: { name: string } }[];
};

/** ข้อความอีเมลของแต่ละสถานะ (สถานะที่ไม่มีในนี้จะไม่ส่งอีเมล) */
export const MESSAGES: Record<string, { subject: (id: number) => string; title: string; body: string; color: string }> = {
  WAITING_VERIFY: {
    subject: (id) => `ได้รับคำสั่งซื้อ #${id} แล้ว`,
    title: "ได้รับคำสั่งซื้อของคุณแล้ว",
    body: "ขอบคุณที่สั่งซื้อกับ MaxTech Electric ทางร้านกำลังตรวจสอบสลิปการโอนเงิน และจะแจ้งให้ทราบอีกครั้งเมื่อยืนยันยอดเรียบร้อย",
    color: "#b45309",
  },
  PAID: {
    subject: (id) => `ยืนยันการชำระเงิน คำสั่งซื้อ #${id}`,
    title: "ยืนยันการชำระเงินเรียบร้อย",
    body: "ทางร้านได้รับยอดเงินของคุณแล้ว และกำลังเตรียมสินค้าเพื่อจัดส่ง",
    color: "#047857",
  },
  PREPARING: {
    subject: (id) => `กำลังแพ็กสินค้า คำสั่งซื้อ #${id}`,
    title: "กำลังแพ็กสินค้าของคุณ",
    body: "ทางร้านกำลังแพ็กสินค้า เมื่อส่งของแล้วจะแจ้งเลขพัสดุให้ทางอีเมลนี้",
    color: "#0369a1",
  },
  SHIPPING: {
    subject: (id) => `จัดส่งแล้ว คำสั่งซื้อ #${id}`,
    title: "สินค้าของคุณถูกจัดส่งแล้ว",
    body: "ทางร้านส่งสินค้าเรียบร้อยแล้ว สามารถติดตามพัสดุได้ด้วยเลขพัสดุด้านล่าง",
    color: "#d71920",
  },
  COMPLETED: {
    subject: (id) => `คำสั่งซื้อ #${id} สำเร็จ`,
    title: "คำสั่งซื้อเสร็จสมบูรณ์",
    body: "ขอบคุณที่ไว้วางใจ MaxTech Electric หากสินค้ามีปัญหาในการใช้งาน แจ้งทางร้านได้ที่หน้าแจ้งปัญหาหรือ LINE",
    color: "#047857",
  },
  CANCELLED: {
    subject: (id) => `คำสั่งซื้อ #${id} ถูกยกเลิก`,
    title: "คำสั่งซื้อถูกยกเลิก",
    body: "คำสั่งซื้อนี้ถูกยกเลิกแล้ว หากคุณโอนเงินไปแล้วหรือไม่ได้เป็นผู้ยกเลิก กรุณาติดต่อทางร้าน",
    color: "#475569",
  },
};

function esc(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** ค่าส่งจากยอดที่บันทึกไว้จริง (เหมือน lib/shipping.ts) */
function shippingOf(total: number, itemsTotal: number, qty: number) {
  const stored = Math.round(total - itemsTotal);
  return stored >= 0 ? stored : 50 + Math.max(0, qty - 2) * 50;
}

export function renderOrderEmail(order: EmailOrder, status: string) {
  const msg = MESSAGES[status];
  if (!msg) return null;
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const qty = order.items.reduce((s, i) => s + i.quantity, 0);
  const shipping = shippingOf(order.total, itemsTotal, qty);
  const orderUrl = `${SITE_URL}/orders/${order.id}`;

  const itemRows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;">${esc(i.product.name)} <span style="color:#64748b;">× ${i.quantity}</span></td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;color:#0f172a;font-size:14px;white-space:nowrap;">฿${(i.price * i.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const carrier = getCarrierTracking(order.shippingCompany);
  const carrierLink = carrier
    ? `
        <div style="margin-top:12px;">
          <a href="${carrier.url}" style="display:inline-block;background:#ffffff;color:#d71920;border:1px solid #d71920;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:700;">ติดตามพัสดุที่เว็บ ${esc(carrier.name)} →</a>
          <div style="margin-top:6px;font-size:12px;color:#64748b;">คัดลอกเลขพัสดุด้านบน แล้ววางในช่องค้นหาบนเว็บขนส่ง</div>
        </div>`
    : "";

  const tracking =
    status === "SHIPPING" && order.trackingNumber
      ? `
      <div style="margin:20px 0;padding:16px;border:2px dashed #fecaca;border-radius:10px;background:#fef2f2;">
        <div style="font-size:13px;color:#b3141a;">${esc(order.shippingCompany || "ขนส่ง")} · เลขพัสดุ</div>
        <div style="font-size:22px;font-weight:700;color:#0f172a;font-family:monospace;letter-spacing:1px;">${esc(order.trackingNumber)}</div>${carrierLink}
      </div>`
      : "";

  const html = `
  <div style="background:#f6f7f9;padding:24px 12px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#d71920;padding:16px 24px;color:#ffffff;font-size:18px;font-weight:700;">MaxTech Electric</div>
      <div style="padding:24px;">
        <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#f1f5f9;color:${msg.color};font-size:12px;font-weight:700;">คำสั่งซื้อ #${order.id}</div>
        <h1 style="margin:12px 0 8px;font-size:22px;color:#0f172a;">${esc(msg.title)}</h1>
        <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">เรียนคุณ${esc(order.name)}<br>${esc(msg.body)}</p>
        ${tracking}
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          ${itemRows}
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">ค่าจัดส่ง</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-size:14px;">฿${shipping.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:700;color:#0f172a;">ยอดรวม</td>
            <td style="padding:10px 0;border-top:1px solid #e2e8f0;text-align:right;font-weight:700;color:#d71920;font-size:18px;">฿${(itemsTotal + shipping).toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
          <b style="color:#334155;">จัดส่งถึง:</b> ${esc(order.name)} · ${esc(order.phone)}<br>${esc(order.address)}
        </p>
        <div style="margin-top:24px;text-align:center;">
          <a href="${orderUrl}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;">ดูรายละเอียดคำสั่งซื้อ</a>
        </div>
      </div>
      <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
        สอบถามเพิ่มเติม โทร ${SHOP_PHONE} · LINE <a href="${SHOP_LINE_URL}" style="color:#d71920;">${SHOP_LINE_ID}</a><br>
        หรือตอบกลับอีเมลนี้ได้เลย · ${SITE_URL.replace(/^https?:\/\//, "")}
      </div>
    </div>
  </div>`;

  const text = [
    `${msg.title} — คำสั่งซื้อ #${order.id}`,
    msg.body,
    status === "SHIPPING" && order.trackingNumber ? `ขนส่ง: ${order.shippingCompany || "-"} เลขพัสดุ: ${order.trackingNumber}` : "",
    status === "SHIPPING" && carrier ? `ติดตามพัสดุ: ${carrier.url}` : "",
    `ยอดรวม ฿${(itemsTotal + shipping).toLocaleString()}`,
    `ดูรายละเอียด: ${orderUrl}`,
    `ติดต่อร้าน: ${SHOP_PHONE} · LINE ${SHOP_LINE_ID}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: `${msg.subject(order.id)} | MaxTech Electric`, html, text };
}
