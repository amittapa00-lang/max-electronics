import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ConfirmOrderForm from "@/components/ConfirmOrderForm";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/login");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: true } } },
  });
  if (cartItems.length === 0) redirect("/cart");

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = itemCount <= 2 ? 100 : 100 + (itemCount - 2) * 50;
  const grandTotal = total + shippingFee;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif" }}>

      <p style={{ fontSize: 22, fontWeight: 500, color: "#111", marginBottom: 28 }}>
        ดำเนินการสั่งซื้อ
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>

        {/* ซ้าย */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            <SectionLabel icon="📦" text="รายการสินค้า" />
            <div>
              {cartItems.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px minmax(0,1fr) auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i < cartItems.length - 1 ? "0.5px solid #e5e7eb" : "none",
                  }}
                >
                  <img
                    src={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
                    alt={item.product.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "0.5px solid #e5e7eb", display: "block" }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      {item.quantity} ชิ้น · ฿{item.product.price.toLocaleString()}/ชิ้น
                    </p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#111", whiteSpace: "nowrap" }}>
                    ฿{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>


          <div style={card}>
            <SectionLabel icon="📍" text="ข้อมูลจัดส่ง" />
            <ConfirmOrderForm />
          </div>

          
        </div>

        {/* ขวา */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={card}>
            <SectionLabel icon="🧾" text="สรุปยอด" />
            <div style={{ borderTop: "0.5px solid #e5e7eb", paddingTop: 12 }}>
              <SumRow label="ราคาสินค้า" value={`฿${total.toLocaleString()}`} />
              <SumRow label={`ค่าจัดส่ง (${itemCount} ชิ้น)`} value={`฿${shippingFee.toLocaleString()}`} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>ยอดรวม</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: "#185FA5" }}>
                ฿{grandTotal.toLocaleString()}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 2 }}>รวม VAT แล้ว</p>
          </div>

          <div style={card}>
            <SectionLabel icon="🏦" text="บัญชีโอนเงิน" />
            <BankRow label="ธนาคาร" value="กสิกรไทย" />
            <BankRow label="ชื่อบัญชี" value="MAX Electronics" />
            <div style={{
              fontSize: 17, fontWeight: 500, color: "#0C447C",
              background: "#E6F1FB", borderRadius: 8,
              padding: "10px 14px", textAlign: "center",
              letterSpacing: "0.04em", margin: "10px 0",
            }}>
              123-4-56789-0
            </div>
            <img
              src="/qr-payment.jpg"
              alt="QR พร้อมเพย์"
              style={{ width: 120, display: "block", margin: "0 auto", borderRadius: 8, border: "0.5px solid #e5e7eb" }}
            />
          </div>

        </div>
      </div>

     
    </main>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid #e5e7eb",
  borderRadius: 12,
  padding: "20px",
};

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 500, color: "#9ca3af",
      textTransform: "uppercase", letterSpacing: "0.05em",
      marginBottom: 14, display: "flex", alignItems: "center", gap: 6,
    }}>
      {icon} {text}
    </p>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontSize: 13, color: "#6b7280",
      padding: "7px 0", borderBottom: "0.5px solid #f3f4f6",
    }}>
      <span>{label}</span>
      <span style={{ color: "#111" }}>{value}</span>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 13, color: "#9ca3af",
      padding: "7px 0", borderBottom: "0.5px solid #f3f4f6",
    }}>
      <span>{label}</span>
      <span style={{ color: "#111", fontWeight: 500 }}>{value}</span>
    </div>
  );
}