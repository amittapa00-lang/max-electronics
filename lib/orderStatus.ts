import { prisma } from "@/lib/prisma";
import { notifyOrderStatus } from "@/lib/orderNotify";

export const ORDER_STATUSES = [
  "PENDING",
  "WAITING_VERIFY",
  "PAID",
  "PREPARING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** สถานะที่ถือว่า "ตัดสต็อกแล้ว" (ตั้งแต่ยืนยันการชำระเงินเป็นต้นไป) */
const STOCK_DEDUCTED: readonly string[] = ["PAID", "PREPARING", "SHIPPING", "COMPLETED"];

export function isOrderStatus(s: unknown): s is OrderStatus {
  return typeof s === "string" && (ORDER_STATUSES as readonly string[]).includes(s);
}

export class OrderStatusError extends Error {
  constructor(message: string, public httpStatus = 400) {
    super(message);
  }
}

/**
 * เปลี่ยนสถานะคำสั่งซื้อพร้อมจัดการสต็อกให้ถูกต้อง
 * - เข้าสู่สถานะที่ชำระแล้วครั้งแรก → ตัดสต็อก (ตรวจว่าสต็อกพอก่อน)
 * - ถอยกลับไปก่อนชำระ หรือยกเลิกคำสั่งซื้อที่ตัดสต็อกแล้ว → คืนสต็อก
 * - เปลี่ยนระหว่างสถานะที่ตัดสต็อกแล้วด้วยกัน → ไม่แตะสต็อก (กันตัดซ้ำ)
 */
export async function changeOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
  extra: { shippingCompany?: string; trackingNumber?: string } = {}
) {
  let shouldNotify = false;

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, stock: true } },
            variant: { select: { id: true, name: true, stock: true } },
          },
        },
      },
    });
    if (!order) throw new OrderStatusError("ไม่พบคำสั่งซื้อ", 404);

    const wasDeducted = STOCK_DEDUCTED.includes(order.status);
    const willDeduct = STOCK_DEDUCTED.includes(newStatus);

    if (!wasDeducted && willDeduct) {
      // รวมจำนวนที่ต้องใช้ต่อ "ตัวเลือก" (หรือต่อสินค้า ถ้าไม่มีตัวเลือก) แล้วเทียบกับสต็อก
      const need = new Map<string, { label: string; have: number; qty: number }>();
      for (const i of order.items) {
        const key = i.variant ? `v${i.variant.id}` : `p${i.productId}`;
        const label = i.variant ? `${i.product.name} (${i.variant.name})` : i.product.name;
        const have = i.variant ? i.variant.stock : i.product.stock;
        const cur = need.get(key) ?? { label, have, qty: 0 };
        cur.qty += i.quantity;
        need.set(key, cur);
      }
      const short = [...need.values()].filter((n) => n.have < n.qty);
      if (short.length > 0) {
        throw new OrderStatusError(
          "สต็อกไม่พอ: " + short.map((n) => `${n.label} (มี ${n.have} ต้องใช้ ${n.qty})`).join(", ")
        );
      }
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    } else if (wasDeducted && !willDeduct) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    // แจ้งลูกค้าเมื่อสถานะเปลี่ยนจริง หรือมีการแก้เลขพัสดุ
    shouldNotify =
      order.status !== newStatus ||
      (extra.trackingNumber !== undefined && extra.trackingNumber !== order.trackingNumber);

    return tx.order.update({
      where: { id: orderId },
      data: { status: newStatus, ...extra },
    });
  });

  if (shouldNotify) notifyOrderStatus(orderId, newStatus);
  return updated;
}
