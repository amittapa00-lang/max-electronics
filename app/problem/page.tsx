import { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Package,
  Clock3,
  RefreshCw,
  FileText,
  ShieldCheck,
  Truck,
  Camera,
  Info,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function ProblemPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>

        {/* ── HERO ── */}
        <section style={{ textAlign: "center", padding: "3rem 1rem 2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 100,
              border: "0.5px solid #FECACA",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle size={14} />
            ศูนย์ช่วยเหลือสินค้า
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#111",
              marginBottom: "1rem",
            }}
          >
            แจ้งปัญหา &amp; เคลมสินค้า
            <br />
            <span style={{ color: "#2563EB" }}>เราพร้อมดูแลคุณทันที</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            ได้รับสินค้าชำรุด เสียหาย หรือไม่ตรงตามคำสั่งซื้อ?
            อ่านเงื่อนไขและเตรียมข้อมูลด้านล่าง เพื่อให้เจ้าหน้าที่ดำเนินการได้รวดเร็วที่สุด
          </p>
        </section>

        {/* ── STEP 1: PREP ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>ขั้นตอนที่ 1</SectionLabel>
          <SectionHead
            title="เตรียมข้อมูลก่อนแจ้งปัญหา"
            sub="ข้อมูลครบ 3 ข้อนี้ช่วยให้เจ้าหน้าที่อนุมัติเรื่องได้เร็วขึ้นมาก"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 12,
              marginTop: "0.75rem",
            }}
          >
            <PrepCard icon={<FileText size={18} />} title="เลขคำสั่งซื้อ" desc="Order Number, ใบเสร็จ หรือสลิปหลักฐานการสั่งซื้อจากระบบ" />
            <PrepCard icon={<Camera size={18} />} title="รูปภาพ / วิดีโอสินค้า" desc="ภาพถ่ายตัวสินค้า กล่องพัสดุ หรือวิดีโอแกะกล่องที่เห็นจุดชำรุดชัดเจน" />
            <PrepCard icon={<Info size={18} />} title="รายละเอียดปัญหา" desc="คำอธิบายอาการเสีย หรือจุดที่ไม่ตรงสเปก เพื่อให้ช่างประเมินได้ตรงจุด" />
          </div>
        </section>

        {/* ── STEP 2: LINE CTA ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>ขั้นตอนที่ 2</SectionLabel>
          <div
            style={{
              background: "#06C755",
              borderRadius: 18,
              padding: "2rem 1.75rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div style={{ maxWidth: 440 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 500, color: "#fff", marginBottom: "0.5rem" }}>
                ส่งข้อมูลผ่าน LINE Official
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.85)", lineHeight: 1.6 }}>
                ส่งข้อมูล 3 ข้อข้างต้นให้เจ้าหน้าที่ในแชท ทีมงานพร้อมตรวจสอบและตอบกลับอย่างรวดเร็ว
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: "0.75rem",
                  fontSize: 12,
                  color: "rgba(255,255,255,.7)",
                  background: "rgba(0,0,0,.12)",
                  padding: "5px 10px",
                  borderRadius: 6,
                }}
              >
                <Clock3 size={13} />
                ทำการทุกวัน จันทร์–เสาร์ เวลา 08:00–17:00 น.
              </div>
            </div>
            <a
              href="https://lin.ee/SmaOgjw"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                color: "#06C755",
                fontSize: 14,
                fontWeight: 500,
                padding: "0.75rem 1.5rem",
                borderRadius: 12,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <MessageCircle size={20} fill="#06C755" />
              เพิ่มเพื่อน &amp; แชทกับเรา
            </a>
          </div>
        </section>

        <Divider />

        {/* ── POLICIES ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>นโยบายของเรา</SectionLabel>
          <SectionHead title="บริการหลังการขายที่มั่นใจได้" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>

            <PolicyCard icon={<RefreshCw size={18} />} iconBg="#EFF6FF" iconColor="#2563EB" title="เปลี่ยน / คืนสินค้า">
              <BulletList color="#2563EB" items={[
                "แจ้งเคลมเปลี่ยนตัวใหม่ได้ภายใน 30 วัน",
                "สินค้าและแพ็กเกจต้องอยู่ในสภาพเดิม",
                "ลูกค้ารับผิดชอบค่าจัดส่งสินค้าคืน",
                "คืนเงินเฉพาะค่าสินค้า ไม่รวมค่าจัดส่ง",
                "ดำเนินการภายใน 7 วันทำการหลังได้รับของคืน",
              ]} />
            </PolicyCard>

            <PolicyCard icon={<FileText size={18} />} iconBg="#FFFBEB" iconColor="#D97706" title="ข้อตกลงการสั่งซื้อ">
              <BulletList color="#DC2626" items={[
                "คำสั่งซื้อที่ชำระแล้ว ไม่สามารถยกเลิกได้",
                "หากส่งแล้ว ไม่สามารถปฏิเสธรับสินค้าได้",
                "ร้านไม่รับผิดชอบกรณีนำไปใช้งานผิดวิธี",
              ]} />
            </PolicyCard>

            <PolicyCard icon={<ShieldCheck size={18} />} iconBg="#DCFCE7" iconColor="#16A34A" title="เงื่อนไขการรับประกัน" highlight>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "0.75rem" }}>
                {["สินค้าใหม่: ประกัน 3 เดือน", "สินค้ามือสอง: ประกัน 1 เดือน"].map((t) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: "#DCFCE7", color: "#166534", border: "0.5px solid #BBF7D0" }}>
                    {t}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#166534", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                ประกันสิ้นสุดทันทีหาก:
              </p>
              <BulletList color="#DC2626" small items={[
                "ใช้งานเกินสเปกกำหนด",
                "ดัดแปลงหรือแกะซ่อมเอง",
                "ไฟไหม้ น้ำท่วม ฟ้าผ่า",
                "อุบัติเหตุ / ตกกระแทก",
                "สติกเกอร์รับประกันชำรุด",
              ]} />
            </PolicyCard>

            <PolicyCard icon={<Truck size={18} />} iconBg="#EFF6FF" iconColor="#2563EB" title="ค่าจัดส่งสำหรับการเคลม">
              <BulletList color="#2563EB" items={[
                "1–2 ชิ้นแรก เหมา 100 บาท ทั่วไทย",
                "ชิ้นถัดไปเพิ่มชิ้นละ 50 บาท",
              ]} />
            </PolicyCard>

            <PolicyCard icon={<Package size={18} />} iconBg="#EFF6FF" iconColor="#2563EB" title="ติดตามพัสดุเคลม">
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, marginBottom: "0.75rem" }}>
                เมื่อส่งสินค้าทดแทนให้แล้ว สามารถตรวจสถานะและเลขแทร็กกิ้งได้ทางหน้าเว็บหรือแจ้งขอจากแอดมิน
              </p>
              <a href="#" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                ตรวจสอบสถานะ <ArrowRight size={13} />
              </a>
            </PolicyCard>

            <PolicyCard icon={<MessageCircle size={18} />} iconBg="#F0FDF4" iconColor="#16A34A" title="สอบถามอื่นๆ">
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55 }}>
                วิธีการใช้งานเบื้องต้น, เช็คสินค้าคงคลัง หรือปรึกษาขนาด/สเปกสินค้า ทักมาหาเราได้ตลอดเวลา
              </p>
            </PolicyCard>

          </div>

          {/* Warning */}
          <div style={{ background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", gap: 12, marginTop: 12 }}>
            <AlertTriangle size={20} style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 500, color: "#DC2626", marginBottom: 4 }}>
                ข้อจำกัดสิทธิ์สำคัญ — โปรดตรวจสอบก่อนซื้อ
              </h4>
              <p style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.55, opacity: 0.85 }}>
                ร้านสงวนสิทธิ์ไม่รับเปลี่ยน คืน หรือคืนเงิน กรณีที่เกิดจากความผิดพลาดของลูกค้า เช่น สั่งซื้อผิดรุ่น, ผิดขนาด, ผิดสี
                กรุณาตรวจทานรายละเอียดในตะกร้าสินค้าก่อนยืนยันชำระเงินทุกครั้ง
              </p>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAN / CANNOT ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>เงื่อนไขการเปลี่ยนสินค้า</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: "0.75rem" }}>
            <ConditionCard icon={<CheckCircle2 size={20} />} iconColor="#16A34A" title="กรณีที่สามารถเปลี่ยนสินค้าได้">
              {[
                "สินค้าชำรุดจากการผลิต (Defect)",
                "ได้รับสินค้าผิดรุ่น ผิดสเปก จากที่สั่งซื้อ",
                "แจ้งเรื่องภายใน 7 วันทำการ นับจากวันเซ็นรับพัสดุ",
                "อุปกรณ์ส่วนควบครบ พร้อมกล่องบรรจุภัณฑ์เดิม",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                  <CheckCircle2 size={16} style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }} />
                  {item}
                </li>
              ))}
            </ConditionCard>

            <ConditionCard icon={<XCircle size={20} />} iconColor="#DC2626" title="กรณีที่ไม่สามารถคืนสินค้าได้">
              {[
                "สินค้า Custom-made หรือสินค้าสั่งพิเศษ",
                "สินค้าเปิดใช้งานแล้ว หรือมีร่องรอยการแกะ",
                "ชำรุดจากการใช้งานผิดประเภทของลูกค้า",
                "ไม่มีกล่องดั้งเดิม หรืออุปกรณ์ภายในสูญหาย",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                  <XCircle size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }} />
                  {item}
                </li>
              ))}
            </ConditionCard>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>ขั้นตอนการดำเนินการ</SectionLabel>
          <SectionHead title="กระบวนการเปลี่ยนสินค้า" />
          <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {[
              { title: "แจ้งปัญหาผ่าน LINE", desc: "แชทหาเจ้าหน้าที่และส่งข้อมูลที่เตรียมไว้" },
              { title: "ตรวจสอบเบื้องต้น", desc: "แอดมินและช่างวิเคราะห์เคสภายใน 24 ชม." },
              { title: "ส่งของกลับโรงงาน", desc: "ลูกค้าแพ็คของเดิมส่งกลับมาที่ร้าน" },
              { title: "จัดส่งชิ้นใหม่", desc: "ร้านส่งสินค้าทดแทนให้ทันที" },
            ].map((step, i) => (
              <div key={step.title} style={{ padding: "1.25rem 1rem", borderRight: i < 3 ? "0.5px solid #E5E7EB" : "none" }}>
                <div style={{ width: 36, height: 36, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#2563EB", marginBottom: "0.75rem" }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── GUARANTEE BAR ── */}
        <div style={{ background: "#FFFBEB", border: "0.5px solid #FDE68A", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: "2rem" }}>
          <Clock3 size={20} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: "#92400E", marginBottom: 4 }}>การันตีระยะเวลาการตอบกลับ</h2>
            <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.55, opacity: 0.85 }}>
              หลังได้รับข้อมูลครบถ้วน เจ้าหน้าที่จะตอบกลับภายใน 24 ชั่วโมง (วันทำการ) และขั้นตอนตรวจเช็คสภาพสินค้าใช้เวลาประมาณ 1–3 วันทำการ
            </p>
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div style={{ textAlign: "center", paddingTop: "2.5rem", borderTop: "0.5px solid #E5E7EB" }}>
          <a
            href="https://lin.ee/SmaOgjw"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#06C755", color: "#fff", fontSize: 15, fontWeight: 500, padding: "0.85rem 2rem", borderRadius: 12, textDecoration: "none" }}
          >
            <MessageCircle size={20} fill="#fff" />
            เปิดแอป LINE แจ้งปัญหาทันที
          </a>
        </div>

      </div>
    </main>
  );
}

/* ────────────────── Sub-components with TypeScript types ────────────────── */

interface SectionLabelProps {
  children: ReactNode;
}
function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "0.5rem" }}>
      {children}
    </p>
  );
}

interface SectionHeadProps {
  title: string;
  sub?: string;
}
function SectionHead({ title, sub }: SectionHeadProps) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: "#111" }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "0.5px solid #E5E7EB", margin: "2rem 0" }} />;
}

interface PrepCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
}
function PrepCard({ icon, title, desc }: PrepCardProps) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "1.25rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#2563EB" }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

interface PolicyCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  highlight?: boolean;
  children: ReactNode;
}
function PolicyCard({ icon, iconBg, iconColor, title, highlight = false, children }: PolicyCardProps) {
  return (
    <div style={{ background: highlight ? "#F0FDF4" : "#fff", border: `0.5px solid ${highlight ? "#BBF7D0" : "#E5E7EB"}`, borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, marginBottom: "0.75rem" }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: "0.75rem" }}>{title}</h3>
      {children}
    </div>
  );
}

interface BulletListProps {
  items: string[];
  color: string;
  small?: boolean;
}
function BulletList({ items, color, small = false }: BulletListProps) {
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
      {items.map((item: string) => (
        <li key={item} style={{ fontSize: small ? 12 : 13, color: "#6B7280", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5, opacity: 0.7 }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

interface ConditionCardProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  children: ReactNode;
}
function ConditionCard({ icon, iconColor, title, children }: ConditionCardProps) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid #F3F4F6", color: iconColor }}>
        {icon}
        <h2 style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>{title}</h2>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </ul>
    </div>
  );
}