"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    productCode: string | null;
    price: number;
    images: { id: number; imageUrl: string }[];
  };
};

const s = {
  wrap: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 24px",
    fontFamily: "sans-serif",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 32,
  } as React.CSSProperties,
  h1: {
    fontSize: 22,
    fontWeight: 500,
    color: "#111",
    margin: 0,
  } as React.CSSProperties,
  countLabel: {
    fontSize: 13,
    color: "#999",
  } as React.CSSProperties,
  itemList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  item: (first: boolean, last: boolean, only: boolean): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "80px 1fr auto",
    gap: 14,
    alignItems: "center",
    padding: "14px 16px",
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: only ? 12 : first ? "12px 12px 0 0" : last ? "0 0 12px 12px" : 0,
  }),
  img: {
    width: 80,
    height: 80,
    objectFit: "cover" as const,
    borderRadius: 8,
    border: "0.5px solid #e5e7eb",
    background: "#f9fafb",
    display: "block",
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
    marginBottom: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  itemCode: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 10,
  },
  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    border: "0.5px solid #d1d5db",
    background: "#f9fafb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#374151",
  },
  qtyBtnL: {
    borderRadius: "6px 0 0 6px",
  } as React.CSSProperties,
  qtyBtnR: {
    borderRadius: "0 6px 6px 0",
  } as React.CSSProperties,
  qtyNum: {
    width: 34,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 500,
    color: "#111",
    background: "#fff",
    borderTop: "0.5px solid #d1d5db",
    borderBottom: "0.5px solid #d1d5db",
  } as React.CSSProperties,
  delBtn: {
    marginLeft: 8,
    padding: "4px 6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    borderRadius: 6,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  priceCol: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: 6,
    minWidth: 80,
  },
  unitPrice: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "right" as const,
  },
  subPrice: {
    fontSize: 15,
    fontWeight: 500,
    color: "#111",
  },
  summary: {
    marginTop: 16,
    border: "0.5px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  } as React.CSSProperties,
  sumRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    fontSize: 13,
    color: "#6b7280",
    borderBottom: "0.5px solid #e5e7eb",
  } as React.CSSProperties,
  sumTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#f9fafb",
  } as React.CSSProperties,
  freeBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: "#0f6e56",
    background: "#e1f5ee",
    padding: "2px 8px",
    borderRadius: 20,
  } as React.CSSProperties,
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 10,
    marginTop: 16,
  } as React.CSSProperties,
  btnBack: {
    padding: "11px 16px",
    border: "0.5px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    textDecoration: "none",
  } as React.CSSProperties,
  btnCheckout: {
    padding: "11px 16px",
    border: "none",
    borderRadius: 10,
    background: "#185FA5",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  } as React.CSSProperties,
};

export default function CartClient({ cartItems }: { cartItems: CartItem[] }) {
  const router = useRouter();

  async function updateQty(id: number, qty: number) {
    if (qty < 1) return;
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    router.refresh();
  }

  async function deleteItem(id: number) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <main style={s.wrap}>

      <div style={s.header}>
        <h1 style={s.h1}>ตะกร้าสินค้า</h1>
        <span style={s.countLabel}>{cartItems.length} รายการ</span>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "64px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>ยังไม่มีสินค้าในตะกร้า</p>
          <Link href="/products" style={{ ...s.btnCheckout, display: "inline-flex", textDecoration: "none" }}>
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <>
          <div style={s.itemList}>
            {cartItems.map((item, i) => {
              const only = cartItems.length === 1;
              const first = i === 0;
              const last = i === cartItems.length - 1;
              return (
                <div key={item.id} style={s.item(first, last, only)}>

                  <img
                    src={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
                    alt={item.product.name}
                    style={s.img}
                  />

                  <div style={{ minWidth: 0 }}>
                    <p style={s.itemName}>{item.product.name}</p>
                    <p style={s.itemCode}>{item.product.productCode || "-"}</p>
                    <div style={s.qtyRow}>
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        style={{ ...s.qtyBtn, ...s.qtyBtnL }}
                        aria-label="ลด"
                      >−</button>
                      <div style={s.qtyNum}>{item.quantity}</div>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        style={{ ...s.qtyBtn, ...s.qtyBtnR }}
                        aria-label="เพิ่ม"
                      >+</button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        style={s.delBtn}
                        aria-label="ลบ"
                      >✕</button>
                    </div>
                  </div>

                  <div style={s.priceCol}>
                    <p style={s.unitPrice}>
                      ฿{item.product.price.toLocaleString()}/ชิ้น
                    </p>
                    <p style={s.subPrice}>
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

          <div style={s.summary}>
            <div style={s.sumRow}>
              <span>ราคาสินค้ารวม</span>
            </div>
            <div style={s.sumTotal}>
              <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>ยอดรวม</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: "#185FA5" }}>
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={s.actions}>
            <Link href="/products" style={s.btnBack}>← เลือกต่อ</Link>
            <button
              onClick={() => router.push("/checkout")}
              style={s.btnCheckout}
            >
               ดำเนินการสั่งซื้อ
            </button>
          </div>
        </>
      )}
    </main>
  );
}