/** ค่าจัดส่ง: 1–2 ชิ้นแรก ฿50 ชิ้นถัดไปเพิ่มชิ้นละ ฿50 */
export const SHIPPING_BASE_FEE = 50;
export const SHIPPING_EXTRA_PER_ITEM = 50;

export function calcShippingFee(totalQty: number): number {
  if (totalQty <= 0) return 0;
  return SHIPPING_BASE_FEE + Math.max(0, totalQty - 2) * SHIPPING_EXTRA_PER_ITEM;
}

/**
 * ค่าจัดส่งของคำสั่งซื้อที่สร้างแล้ว — คิดจากยอดที่บันทึกไว้จริง (order.total - ค่าสินค้า)
 * เพื่อให้คำสั่งซื้อเก่าแสดงค่าส่งตามที่ลูกค้าจ่ายจริง แม้อัตราค่าส่งจะเปลี่ยนภายหลัง
 */
export function orderShippingFee(orderTotal: number, itemsTotal: number, totalQty: number): number {
  const stored = Math.round(orderTotal - itemsTotal);
  return stored >= 0 ? stored : calcShippingFee(totalQty);
}
