import { ReactNode } from "react";
import {
  Zap,
  Package,
  FileText,
  Factory,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock3,
  ChevronRight,
} from "lucide-react";

export default function AboutPage() {
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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.25rem 4rem" }}>

        {/* ── HERO ── */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#EFF6FF",
              color: "#2563EB",
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 14px",
              borderRadius: 100,
              border: "0.5px solid #BFDBFE",
              marginBottom: "1.25rem",
            }}
          >
            <Zap size={13} />
            เกี่ยวกับเรา
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 500,
              lineHeight: 1.15,
              color: "#111",
              marginBottom: "1rem",
              maxWidth: 560,
            }}
          >
            MaxTech Electric
            <br />
            <span style={{ color: "#2563EB" }}>อุปกรณ์อุตสาหกรรม</span>ครบวงจร
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#6B7280",
              lineHeight: 1.75,
              maxWidth: 520,
              marginBottom: "2rem",
            }}
          >
            จำหน่ายอุปกรณ์อิเล็กทรอนิกส์ อุตสาหกรรม และอะไหล่ระบบ Automation
            พร้อมบริการหลังการขายที่รวดเร็วและเชื่อถือได้ รองรับทั้งลูกค้ารายย่อยและโรงงานอุตสาหกรรม
          </p>

          {/* Stat pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { value: "10+", label: "ปีประสบการณ์" },
              { value: "5,000+", label: "รายการสินค้า" },
              { value: "1,000+", label: "ลูกค้าโรงงาน" },
              { value: "จัดส่ง", label: "ทั่วประเทศไทย" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "0.6rem 1.1rem",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 500, color: "#2563EB" }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── VISION + HIGHLIGHTS ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 12,
            marginBottom: "2rem",
          }}
        >
          {/* วิสัยทัศน์ */}
          <div
            style={{
              background: "#2563EB",
              borderRadius: 16,
              padding: "1.75rem",
              color: "#fff",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: "0.75rem" }}>
              วิสัยทัศน์
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,.92)" }}>
              มุ่งมั่นเป็นศูนย์รวมสินค้าอุตสาหกรรมและอุปกรณ์อิเล็กทรอนิกส์คุณภาพสูง
              พร้อมบริการที่รวดเร็ว เชื่อถือได้ และตอบโจทย์ทุกความต้องการของลูกค้าองค์กร
            </p>
          </div>

          {/* พันธกิจ */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #E5E7EB",
              borderRadius: 16,
              padding: "1.75rem",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "0.75rem" }}>
              พันธกิจ
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: "#4B5563" }}>
              ส่งมอบสินค้าคุณภาพมาตรฐานในราคาที่แข่งขันได้ พร้อมทีมงานผู้เชี่ยวชาญ
              ที่พร้อมให้คำแนะนำด้านเทคนิคและบริการหลังการขายอย่างมืออาชีพ
            </p>
          </div>
        </section>

        {/* ── HIGHLIGHTS ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>จุดเด่นของเรา</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginTop: "0.75rem" }}>
            {[
              { icon: <Package size={18} />, title: "สินค้าพร้อมส่ง", desc: "สต็อกสินค้าหลายพันรายการ พร้อมจัดส่งได้ทันที ไม่ต้องรอนาน" },
              { icon: <FileText size={18} />, title: "ออกใบเสนอราคาได้", desc: "รองรับการออกเอกสาร PO / ใบเสนอราคา และใบกำกับภาษี สำหรับองค์กร" },
              { icon: <Factory size={18} />, title: "รองรับลูกค้าโรงงาน", desc: "มีทีมเทคนิคพร้อมให้คำปรึกษาและจัดหาอะไหล่ตามสเปกโรงงาน" },
              { icon: <Truck size={18} />, title: "จัดส่งทั่วประเทศ", desc: "ขนส่งพัสดุทุกจังหวัดทั่วไทย ติดตามสถานะพัสดุได้แบบ real-time" },
              { icon: <ShieldCheck size={18} />, title: "สินค้าคุณภาพมาตรฐาน", desc: "คัดสรรสินค้าจากผู้ผลิตที่ได้รับการรับรองมาตรฐานสากล" },
              { icon: <Zap size={18} />, title: "บริการหลังการขาย", desc: "ทีมงานพร้อมดูแลหลังการขาย รับประกันสินค้า และรับเคลมอย่างรวดเร็ว" },
            ].map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
            ))}
          </div>
        </section>

        {/* ── PRODUCT CATEGORIES ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionLabel>หมวดหมู่สินค้า</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "0.75rem" }}>
            {[
              "เซนเซอร์อุตสาหกรรม", "PLC & Controllers", "Variable Speed Drive",
              "Motor & Inverter", "Relay & Timer", "Power Supply",
              "Cable & Connector", "HMI & Display", "Pneumatics",
              "Safety Components", "Servo System", "Automation Parts",
            ].map((cat) => (
              <div
                key={cat}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fff",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {cat}
                <ChevronRight size={12} style={{ color: "#9CA3AF" }} />
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── CONTACT ── */}
        <section>
          <SectionLabel>ติดต่อเรา</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginTop: "0.75rem" }}>
            <ContactCard
              icon={<Phone size={16} />}
              label="โทรศัพท์"
              value={
                <a
                  href="tel:0946861981"
                  style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  094-686-1981
                </a>
              }
              sub="จันทร์–เสาร์ 08:00–17:00"
            />

            <ContactCard
              icon={<Mail size={16} />}
              label="อีเมล"
              value={
                <a
                  href="mailto:maxtechelectric1@gmail.com"
                  style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  maxtechelectric1@gmail.com
                </a>
              }
              sub="ตอบกลับภายใน 24 ชม."
            />

            <ContactCard
              icon={<MapPin size={16} />}
              label="ที่อยู่"
              value="ถนนท้ายบ้าน ตำบลท้ายบ้าน อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ 10280"
              sub={
                <a
                  href="https://maps.google.com/?q=13.558246,100.594413"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563EB", textDecoration: "underline" }}
                >
                  ดูแผนที่และเส้นทาง
                </a>
              }
            />

            <ContactCard 
              icon={<Clock3 size={16} />} 
              label="เวลาทำการ" 
              value="09:00 – 18:00 น." 
              sub="ปิดวันอาทิตย์และวันหยุด" 
            />
          </div>
        </section>

      </div>
    </main>
  );
}

/* ── Sub-components ── */

interface SectionLabelProps { children: ReactNode }
function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 0 }}>
      {children}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "0.5px solid #E5E7EB", margin: "2rem 0" }} />;
}

interface FeatureCardProps { icon: ReactNode; title: string; desc: string }
function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", marginBottom: "0.75rem" }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// 🛠️ แก้ไขเรียบร้อย: เปลี่ยนประเภทจาก string เป็น ReactNode เพื่อรอบรับการส่ง Component ย่อยและ Tag HTML
interface ContactCardProps { 
  icon: ReactNode; 
  label: string; 
  value: ReactNode; 
  sub: ReactNode; 
}

function ContactCard({ icon, label, value, sub }: ContactCardProps) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "1.1rem 1.25rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>{label}</p>
        {/* เปลี่ยนจากโครงสร้าง <p> เป็น <div> เพื่อให้ถูกต้องตามหลัก Semantic HTML เมื่อมีแท็ก <a> อยู่ภายใน */}
        <div style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 2 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</div>
      </div>
    </div>
  );
}