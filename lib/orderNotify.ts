import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail";
import { MESSAGES, renderOrderEmail } from "@/lib/orderEmailTemplate";

/** อีเมลจริงเท่านั้น (บัญชี LINE/Facebook ที่ไม่มีอีเมลจะเป็น @users.invalid) */
function isDeliverable(email?: string | null) {
  return !!email && /@/.test(email) && !email.toLowerCase().endsWith(".invalid");
}

async function sendOrderStatusEmail(orderId: number, status: string) {
  if (!MESSAGES[status] || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order || !isDeliverable(order.user.email)) return;

  const mail = renderOrderEmail(order, status);
  if (!mail) return;

  await transporter.sendMail({
    from: `"MaxTech Electric" <${process.env.EMAIL_USER}>`,
    to: order.user.email,
    ...mail,
  });
}

/**
 * แจ้งลูกค้าทางอีเมลเมื่อสถานะคำสั่งซื้อเปลี่ยน
 * ส่งหลังตอบกลับแล้ว (after) เพื่อไม่ให้แอดมินต้องรอ และถ้าส่งไม่สำเร็จจะไม่กระทบการเปลี่ยนสถานะ
 */
export function notifyOrderStatus(orderId: number, status: string) {
  if (!MESSAGES[status]) return;
  after(async () => {
    try {
      await sendOrderStatusEmail(orderId, status);
    } catch (err) {
      console.error(`ส่งอีเมลแจ้งสถานะคำสั่งซื้อ #${orderId} (${status}) ไม่สำเร็จ:`, err);
    }
  });
}
