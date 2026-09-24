import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendQuoteNotification(data: {
  quoteId: number;
  productName: string;
  quantity: number;
  customerName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  note?: string | null;
}) {
  await transporter.sendMail({
    from: `"MaxTech Electric" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_NOTIFY?.split(",").map((email) => email.trim()),
    subject: `🔔 มีใบเสนอราคาใหม่ #${data.quoteId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7;">
        <h2 style="color:#2563eb;">🔔 มีใบเสนอราคาใหม่</h2>

        <p><strong>เลขที่ใบเสนอราคา:</strong> #${data.quoteId}</p>

        <hr />

        <h3>ข้อมูลลูกค้า</h3>

        <p><strong>ชื่อ:</strong> ${data.customerName}</p>
        <p><strong>บริษัท:</strong> ${data.companyName || "-"}</p>
        <p><strong>อีเมล:</strong> ${data.email}</p>
        <p><strong>โทรศัพท์:</strong> ${data.phone}</p>

        <h3>ข้อมูลสินค้า</h3>

        <p><strong>สินค้า:</strong> ${data.productName}</p>
        <p><strong>จำนวน:</strong> ${data.quantity}</p>

        <p><strong>หมายเหตุ:</strong><br />
        ${data.note || "-"}</p>

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