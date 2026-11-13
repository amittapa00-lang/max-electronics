import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// กันข้อความที่ลูกค้าพิมพ์ถูกตีความเป็น HTML ในอีเมล
const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);

export async function sendQuoteNotification(data: {
  quoteId: number;
  /** ไม่มี = ขอใบเสนอราคาทั่วไป (ดู items) */
  productName?: string | null;
  quantity?: number | null;
  items?: string | null;
  customerName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  note?: string | null;
}) {
  await transporter.sendMail({
    from: `"MaxTech Electric" <${process.env.EMAIL_USER}>`,
    to: [
      process.env.EMAIL_USER!,
      ...(process.env.EMAIL_NOTIFY || "")
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    ],
    subject: `🔔 มีใบเสนอราคาใหม่ #${data.quoteId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7;">
        <h2 style="color:#2563eb;">🔔 มีใบเสนอราคาใหม่</h2>

        <p><strong>เลขที่ใบเสนอราคา:</strong> #${data.quoteId}</p>

        <hr />

        <h3>ข้อมูลลูกค้า</h3>

        <p><strong>ชื่อ:</strong> ${esc(data.customerName)}</p>
        <p><strong>บริษัท:</strong> ${esc(data.companyName || "-")}</p>
        <p><strong>อีเมล:</strong> ${esc(data.email)}</p>
        <p><strong>โทรศัพท์:</strong> ${esc(data.phone)}</p>

        <h3>ข้อมูลสินค้า</h3>

        ${
          data.productName
            ? `<p><strong>สินค้า:</strong> ${esc(data.productName)}</p>
        <p><strong>จำนวน:</strong> ${esc(data.quantity)}</p>`
            : ""
        }
        ${data.items ? `<p><strong>รายการที่ลูกค้าต้องการ:</strong><br />${esc(data.items).replace(/\n/g, "<br />")}</p>` : ""}

        <p><strong>หมายเหตุ:</strong><br />
        ${esc(data.note || "-")}</p>

        <hr />

        <p style="color:#64748b;">
          กรุณาเข้าสู่ระบบ Admin เพื่อตรวจสอบรายละเอียดใบเสนอราคา
        </p>
      </div>
    `,
  });
}

export async function sendOrderNotification(data: {
  orderId: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  itemCount: number;
}) {
  await transporter.sendMail({
    from: `"MaxTech Electric" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🛒 มีคำสั่งซื้อใหม่ #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7;">
        <h2 style="color:#2563eb;">🛒 มีคำสั่งซื้อใหม่</h2>

        <p><strong>เลขที่คำสั่งซื้อ:</strong> #${data.orderId}</p>

        <hr />

        <h3>ข้อมูลลูกค้า</h3>

        <p><strong>ชื่อ:</strong> ${data.customerName}</p>
        <p><strong>อีเมล:</strong> ${data.email}</p>
        <p><strong>โทรศัพท์:</strong> ${data.phone}</p>

        <h3>ข้อมูลคำสั่งซื้อ</h3>

        <p><strong>จำนวนสินค้า:</strong> ${data.itemCount} ชิ้น</p>

        <p>
          <strong>ยอดรวม:</strong>
          <span style="font-size:20px;color:#2563eb;">
            ${data.total.toLocaleString("th-TH")} บาท
          </span>
        </p>

        <h3>ที่อยู่จัดส่ง</h3>

        <p>${data.address}</p>

        <hr />

        <p style="color:#64748b;">
          กรุณาเข้าสู่ระบบ Admin เพื่อตรวจสอบและดำเนินการคำสั่งซื้อ
        </p>
      </div>
    `,
  });
}