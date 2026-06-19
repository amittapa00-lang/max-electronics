import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const ORDER_STEPS = [
  { label: "รอชำระเงิน", icon: "💳", key: "PENDING" },
  { label: "ตรวจสลิป", icon: "🔍", key: "WAITING_VERIFY" },
  { label: "ชำระแล้ว", icon: "✅", key: "PAID" },
  { label: "เตรียมสินค้า", icon: "📦", key: "PREPARING" },
  { label: "จัดส่ง", icon: "🚚", key: "SHIPPING" },
  { label: "สำเร็จ", icon: "🏠", key: "COMPLETED" },
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    PENDING: 0, WAITING_VERIFY: 1, PAID: 2,
    PREPARING: 3, SHIPPING: 4, COMPLETED: 5, CANCELLED: -1,
  };
  return map[status] ?? 0;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    COMPLETED: { background: "#EAF3DE", color: "#27500A", borderColor: "#97C459" },
    PENDING:   { background: "#FAEEDA", color: "#633806", borderColor: "#FAC775" },
    WAITING_VERIFY: { background: "#FAEEDA", color: "#633806", borderColor: "#FAC775" },
    PAID:      { background: "#E6F1FB", color: "#0C447C", borderColor: "#85B7EB" },
    PREPARING: { background: "#E6F1FB", color: "#0C447C", borderColor: "#85B7EB" },
    SHIPPING:  { background: "#E6F1FB", color: "#0C447C", borderColor: "#85B7EB" },
    CANCELLED: { background: "#FCEBEB", color: "#791F1F", borderColor: "#F09595" },
  };
  const labels: Record<string, string> = {
    PENDING: "รอชำระเงิน", WAITING_VERIFY: "รอตรวจสลิป",
    PAID: "ชำระเงินแล้ว", PREPARING: "กำลังเตรียมสินค้า",
    SHIPPING: "กำลังจัดส่ง", COMPLETED: "จัดส่งสำเร็จ", CANCELLED: "ยกเลิกแล้ว",
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 500, padding: "4px 12px",
      borderRadius: 20, border: "0.5px solid",
      ...(styles[status] ?? { background: "#f3f4f6", color: "#6b7280", borderColor: "#d1d5db" }),
    }}>
      {labels[status] ?? status}
    </span>
  );
}

function PolicySection() {
  return (
    <details style={{ border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <summary style={{
        padding: "14px 20px", cursor: "pointer", listStyle: "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", fontSize: 12, fontWeight: 500,
        color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em",
        userSelect: "none",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          📋 นโยบายการเปลี่ยน / คืนสินค้า และการรับประกัน
        </span>
        <span style={{ fontSize: 16, color: "#d1d5db" }}>›</span>
      </summary>

      <div style={{ padding: "0 20px 20px", background: "#fff", borderTop: "0.5px solid #e5e7eb" }}>

        {/* ข้อตกลงการสั่งซื้อ */}
        <PolicyBlock title="📌 ข้อตกลงการสั่งซื้อและการยกเลิก" color="#FAEEDA" borderColor="#FAC775" textColor="#633806">
          <PolicyList items={[
            "คำสั่งซื้อที่ชำระเงินและยืนยันรายการแล้ว ไม่สามารถยกเลิกได้",
            "กรณีร้านค้าได้ดำเนินการจัดส่งสินค้าแล้ว จะไม่สามารถยกเลิกคำสั่งซื้อได้",
            "ร้านค้าไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานผิดวิธี การติดตั้งไม่ถูกต้อง หรือเหตุสุดวิสัยภายหลังจากลูกค้าได้รับสินค้า",
          ]} />
        </PolicyBlock>

        {/* นโยบายการเปลี่ยน */}
        <PolicyBlock title="🔄 นโยบายการเปลี่ยนสินค้า" color="#E6F1FB" borderColor="#85B7EB" textColor="#0C447C">
          <PolicyList items={[
            "กรณีสินค้าเกิดความเสียหายจากการผลิต หรือไม่สามารถใช้งานได้ตามปกติ สามารถแจ้งขอเปลี่ยนได้ภายใน 30 วัน นับจากวันที่ได้รับสินค้า",
            "สินค้าที่ส่งเคลมต้องอยู่ในสภาพเดิม พร้อมบรรจุภัณฑ์ อุปกรณ์ครบถ้วน และสติกเกอร์รับประกันของร้านต้องไม่ฉีกขาด ชำรุด หรือถูกแก้ไข",
            "หากร้านค้าไม่มีสินค้ารุ่นเดียวกัน ขอสงวนสิทธิ์คืนเงินค่าสินค้า หรือเปลี่ยนเป็นสินค้ารุ่นอื่นที่มีมูลค่าเทียบเท่า",
            "ค่าจัดส่งสินค้ากลับมายังร้านค้า ลูกค้าเป็นผู้รับผิดชอบ",
            "กรณีได้รับอนุมัติการคืนเงิน ร้านค้าจะคืนเฉพาะค่าสินค้า ไม่รวมค่าจัดส่ง",
            "ทางร้านจะดำเนินการจัดส่งสินค้าทดแทนหรือคืนเงินภายใน 7 วันทำการ หลังได้รับสินค้าคืนและตรวจสอบแล้ว",
          ]} />
        </PolicyBlock>

        {/* การรับประกัน */}
        <PolicyBlock title="🛡️ เงื่อนไขการรับประกัน" color="#EAF3DE" borderColor="#97C459" textColor="#27500A">
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <WarrantyBadge label="สินค้าใหม่" value="3 เดือน" />
            <WarrantyBadge label="สินค้ามือสอง" value="1 เดือน" />
          </div>
          <p style={{ fontSize: 12, color: "#27500A", marginBottom: 6, fontWeight: 500 }}>
            ครอบคลุมเฉพาะความเสียหายที่เกิดจากตัวสินค้า ภายใต้การใช้งานตามปกติ
          </p>
          <p style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>การรับประกัน <strong>ไม่ครอบคลุม</strong> กรณีดังต่อไปนี้</p>
          <PolicyList items={[
            "การใช้งานเกินสเปกหรือผิดวัตถุประสงค์ของสินค้า",
            "ความเสียหายจากการติดตั้ง ดัดแปลง หรือซ่อมแซมโดยไม่ได้รับอนุญาต",
            "ความเสียหายจากอุบัติเหตุ ไฟไหม้ น้ำท่วม ไฟฟ้าลัดวงจร ฟ้าผ่า หรือภัยธรรมชาติ",
            "ความเสียหายจากความประมาทหรือการใช้งานไม่ถูกต้องของผู้ใช้",
            "สินค้าที่สติกเกอร์รับประกันชำรุด ฉีกขาด ถูกลอก หรือมีการแก้ไข",
          ]} />
        </PolicyBlock>

        {/* ข้อสงวนสิทธิ์ */}
        <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "12px 14px", marginTop: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#791F1F", marginBottom: 4 }}>⚠️ ข้อสงวนสิทธิ์</p>
          <p style={{ fontSize: 12, color: "#A32D2D", lineHeight: 1.7 }}>
            ทางร้านไม่รับเปลี่ยน คืน หรือคืนเงินสินค้า กรณีที่ลูกค้าสั่งซื้อผิดรุ่น ผิดสเปก ผิดขนาด หรือผิดประเภทสินค้า
            กรุณาตรวจสอบรายละเอียดสินค้าให้ถูกต้องก่อนทำการสั่งซื้อทุกครั้ง
          </p>
        </div>

      </div>
    </details>
  );
}

function PolicyBlock({
  title, color, borderColor, textColor, children,
}: {
  title: string; color: string; borderColor: string; textColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: color, border: `0.5px solid ${borderColor}`, borderRadius: 8, padding: "12px 14px", marginTop: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: textColor, marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul style={{ fontSize: 12, color: "#374151", paddingLeft: 16, lineHeight: 1.9, margin: 0 }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function WarrantyBadge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #97C459", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
      <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#27500A" }}>{value}</p>
    </div>
  );
}

function calcShippingFee(totalQty: number): number {
  if (totalQty <= 2) return 100;
  return 100 + (totalQty - 2) * 50;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        include: { product: { include: { images: true } } },
      },
    },
  });
  if (!order) notFound();

  const currentStep = getStepIndex(order.status);
  const doneLinePct = Math.max(0, Math.min(100, (currentStep / (ORDER_STEPS.length - 1)) * 100));

  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calcShippingFee(totalQty);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif" }}>

      {/* Header — เพิ่มเลขที่สั่งซื้อเข้ามาตรงนี้ */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>คำสั่งซื้อ</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111", margin: 0 }}>
            รหัสคำสั่งซื้อ maxelectronics#{order.id}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress Steps */}
      {order.status !== "CANCELLED" && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", padding: "0 4px" }}>
            {/* track bg */}
            <div style={{ position: "absolute", top: 14, left: 24, right: 24, height: 1, background: "#e5e7eb" }} />
            {/* track done */}
            <div style={{ position: "absolute", top: 14, left: 24, height: 1, background: "#3B6D11", width: `calc(${doneLinePct}% - 48px * ${doneLinePct / 100})`, transition: "width .3s" }} />

            {ORDER_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, position: "relative" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 500,
                    border: "0.5px solid",
                    background: done ? "#EAF3DE" : active ? "#185FA5" : "#fff",
                    borderColor: done ? "#97C459" : active ? "#185FA5" : "#e5e7eb",
                    color: done ? "#27500A" : active ? "#fff" : "#9ca3af",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <p style={{ fontSize: 11, color: (done || active) ? "#111" : "#9ca3af", textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div style={{ background: "#E6F1FB", border: "0.5px solid #85B7EB", borderRadius: 10, padding: "12px 16px", margin: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, color: "#185FA5", marginBottom: 3 }}>
              🚚 {order.shippingCompany}
            </p>
            <p style={{ fontSize: 17, fontWeight: 500, color: "#0C447C", letterSpacing: "0.04em" }}>
              {order.trackingNumber}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: 14, alignItems: "start", marginTop: 14 }}>

        {/* ซ้าย */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ข้อมูลจัดส่ง */}
          <div style={card}>
            <SectionLabel icon="📍" text="ข้อมูลจัดส่ง" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f9fafb", borderRadius: 8, padding: 14 }}>
              <InfoItem label="ชื่อผู้รับ" value={order.name} />
              <InfoItem label="เบอร์โทรศัพท์" value={order.phone} />
              <div style={{ gridColumn: "1/-1", borderTop: "0.5px solid #e5e7eb", paddingTop: 10, marginTop: 2 }}>
                <InfoItem label="ที่อยู่จัดส่ง" value={order.address} />
              </div>
              {order.note && (
                <div style={{ gridColumn: "1/-1", borderTop: "0.5px solid #e5e7eb", paddingTop: 10, marginTop: 2 }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>หมายเหตุ</p>
                  <p style={{ fontSize: 13, color: "#92400e", background: "#fffbeb", border: "0.5px solid #fde68a", borderRadius: 6, padding: "6px 10px" }}>
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* รายการสินค้า */}
          <div style={card}>
            <SectionLabel icon="📦" text={`รายการสินค้า (${order.items.length})`} />
            <div>
              {order.items.map((item, i) => (
                <div key={item.id} style={{
                  display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto",
                  gap: 12, alignItems: "center", padding: "11px 0",
                  borderBottom: i < order.items.length - 1 ? "0.5px solid #e5e7eb" : "none",
                }}>
                  <a href={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"} target="_blank">
                    <Image
                      src={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
                      alt={item.product.name}
                      width={52}
                      height={52}
                      style={{ objectFit: "cover", borderRadius: 8, border: "0.5px solid #e5e7eb", display: "block" }}
                    />
                  </a>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      {item.quantity} ชิ้น · ฿{item.price.toLocaleString()}/ชิ้น
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111", whiteSpace: "nowrap" }}>
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ขวา */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* สรุปยอด */}
          <div style={card}>
            <SectionLabel icon="🧾" text="สรุปยอด" />
            <SumRow label="ราคาสินค้า" value={`฿${order.total.toLocaleString()}`} />
            <SumRow label={`ค่าจัดส่ง (${totalQty} ชิ้น)`} value={`฿${shippingFee.toLocaleString()}`} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>ยอดรวม</span>
              <span style={{ fontSize: 20, fontWeight: 500, color: "#185FA5" }}>
                ฿{(order.total + shippingFee).toLocaleString()}
              </span>
            </div>
          </div>

          {/* สลิป */}
          {order.slip && (
            <div style={card}>
              <SectionLabel icon="📎" text="สลิปโอนเงิน" />
              <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#f9fafb" }}>
                <Image src={order.slip} alt="สลิป" width={400} height={220} style={{ width: "100%", height: "auto", display: "block", maxHeight: 220, objectFit: "contain" }} />
              </div>
            </div>
          )}

          {/* ศูนย์ช่วยเหลือ */}
          <div style={card}>
            <SectionLabel icon="💬" text="ศูนย์ช่วยเหลือ" />
            {[
              { label: "จัดส่งแล้ว แต่ยังไม่ได้รับสินค้า" },
              { label: "แก้ไขที่อยู่จัดส่ง" },
              { label: "ชำระแล้ว สถานะไม่เปลี่ยน" },
            ].map((item, i) => (
              <a key={i} href="https://lin.ee/SmaOgjw" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#6b7280", textDecoration: "none", marginBottom: 6 }}>
                {item.label}
                <span style={{ fontSize: 16, color: "#d1d5db" }}>›</span>
              </a>
            ))}
          </div>

          {/* ยกเลิก */}
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <div style={{ border: "0.5px solid #F09595", borderRadius: 12, padding: 14, background: "#FCEBEB" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#791F1F", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                ⚠️ ข้อตกลงการยกเลิก
              </p>
              <ul style={{ fontSize: 12, color: "#A32D2D", paddingLeft: 14, lineHeight: 1.9 }}>
                <li>ไม่คืนเงินทุกกรณี</li>
                <li>หากจัดส่งแล้ว ยกเลิกไม่ได้</li>
                <li>ร้านไม่รับผิดชอบความเสียหาย</li>
              </ul>
              <form action={`/api/orders/${order.id}/cancel`} method="POST" style={{ marginTop: 12 }}>
                <button type="submit" style={{ width: "100%", padding: "10px 0", background: "#fff", border: "0.5px solid #F09595", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#A32D2D", cursor: "pointer" }}>
                  ✕ ยกเลิกคำสั่งซื้อ
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Policy Section — full width below the grid */}
      <PolicySection />

    </main>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid #e5e7eb",
  borderRadius: 12,
  padding: "18px 20px",
};

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
      {icon} {text}
    </p>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#111", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", padding: "7px 0", borderBottom: "0.5px solid #f3f4f6" }}>
      <span>{label}</span>
      <span style={{ color: "#111" }}>{value}</span>
    </div>
  );
}