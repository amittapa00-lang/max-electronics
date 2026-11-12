import { SHOP_SENDER, formatPhone, postalCodeOf } from "@/lib/shop";

export type LabelSize = "100x150" | "a4";
type Size = LabelSize;

const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" });

const STATUS_NOTE: Record<string, string> = {
  PENDING: "ยังไม่ชำระเงิน",
  WAITING_VERIFY: "รอตรวจสลิป",
  CANCELLED: "ยกเลิกแล้ว",
};

export type LabelOrder = {
  id: number;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  status: string;
  createdAt: Date;
  trackingNumber: string | null;
  shippingCompany: string | null;
  items: { id: number; quantity: number; variantName: string | null; product: { name: string; productCode: string | null } }[];
};

export default function ShippingLabel({ order, size }: { order: LabelOrder; size: Size }) {
  const zip = postalCodeOf(order.address);
  const qty = order.items.reduce((s, i) => s + i.quantity, 0);
  const maxItems = size === "a4" ? 6 : 5;
  const shown = order.items.slice(0, maxItems);
  const more = order.items.length - shown.length;
  const warn = STATUS_NOTE[order.status];

  return (
    <article className="ship-label">
      <header className="lbl-head">
        <span className="lbl-brand">{SHOP_SENDER.name}</span>
        <span className="lbl-order">#{order.id}</span>
      </header>

      <section className="lbl-from">
        <span className="lbl-tag">ผู้ส่ง</span>
        <div>
          <b>{SHOP_SENDER.name}</b> โทร {SHOP_SENDER.phone}
          <br />
          {SHOP_SENDER.address}
        </div>
      </section>

      <section className="lbl-to">
        <div className="lbl-to-top">
          <span className="lbl-tag lbl-tag-dark">ผู้รับ</span>
          {zip && <span className="lbl-zip">{zip}</span>}
        </div>
        <p className="lbl-name">{order.name}</p>
        <p className="lbl-phone">โทร {formatPhone(order.phone)}</p>
        <p className="lbl-addr">{order.address}</p>
      </section>

      {(order.shippingCompany || order.trackingNumber) && (
        <section className="lbl-track">
          {order.shippingCompany && <span>{order.shippingCompany}</span>}
          {order.trackingNumber && <b>{order.trackingNumber}</b>}
        </section>
      )}

      <section className="lbl-items">
        <p className="lbl-items-title">
          รายการสินค้า ({qty} ชิ้น)
          {warn && <span className="lbl-warn">{warn}</span>}
        </p>
        <ul>
          {shown.map((it) => (
            <li key={it.id}>
              <span className="lbl-qty">{it.quantity}×</span>
              <span className="lbl-item">
                {it.product.productCode && <b>{it.product.productCode} </b>}
                {it.product.name}
                {it.variantName && ` (${it.variantName})`}
              </span>
            </li>
          ))}
          {more > 0 && <li className="lbl-more">+ อีก {more} รายการ</li>}
        </ul>
        {order.note && <p className="lbl-note">หมายเหตุ: {order.note}</p>}
      </section>

      <footer className="lbl-foot">
        <span>สั่งซื้อ {dateFmt.format(order.createdAt)}</span>
        <span>{SHOP_SENDER.website}</span>
      </footer>
    </article>
  );
}

/** สไตล์ใบปะหน้า — ใช้หน่วย มม. ให้ขนาดตรงกับกระดาษจริง */
export function labelCss(size: Size) {
  const thermal = size === "100x150";
  const w = thermal ? "100mm" : "190mm";
  const h = thermal ? "150mm" : "130mm";
  return `
@page { size: ${thermal ? "100mm 150mm" : "A4 portrait"}; margin: ${thermal ? "0" : "10mm"}; }
.label-stack { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.label-sheet { display: flex; flex-direction: column; gap: 0; background: #fff; padding: 0; }
.cut-line { width: ${w}; border-top: 1px dashed #94a3b8; margin: 5mm 0; }
.ship-label {
  width: ${w}; height: ${h}; box-sizing: border-box; overflow: hidden;
  display: flex; flex-direction: column; background: #fff; color: #000;
  border: 0.4mm solid #000; font-size: ${thermal ? "9pt" : "12pt"}; line-height: 1.3;
  font-family: var(--font-thai), "Tahoma", sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  box-shadow: 0 1px 3px rgb(0 0 0 / .12), 0 8px 24px rgb(0 0 0 / .08);
}
.lbl-head { display: flex; justify-content: space-between; align-items: center; background: #000; color: #fff; padding: 1.6mm 3mm; }
.lbl-brand { font-weight: 700; font-size: 1.1em; letter-spacing: .02em; }
.lbl-order { font-weight: 700; font-size: 1.5em; }
.lbl-from { display: flex; gap: 2mm; padding: 2mm 3mm; border-bottom: 0.4mm solid #000; font-size: .85em; line-height: 1.35; }
.lbl-tag { flex: none; align-self: flex-start; border: 0.3mm solid #000; border-radius: 1mm; padding: 0 1.5mm; font-weight: 700; font-size: .9em; }
.lbl-tag-dark { background: #000; color: #fff; font-size: 1em; padding: .3mm 2mm; }
.lbl-to { flex: 1 1 auto; min-height: 0; padding: 2.5mm 3mm; border-bottom: 0.4mm solid #000; overflow: hidden; }
.lbl-to-top { display: flex; justify-content: space-between; align-items: flex-start; }
.lbl-zip { border: 0.6mm solid #000; padding: .5mm 2.5mm; font-weight: 700; font-size: 1.9em; letter-spacing: .12em; line-height: 1.1; }
.lbl-name { margin-top: 1.5mm; font-weight: 700; font-size: 1.9em; line-height: 1.2; }
.lbl-phone { font-weight: 700; font-size: 1.6em; margin-top: .5mm; }
.lbl-addr { margin-top: 1.5mm; font-size: 1.45em; line-height: 1.4; white-space: pre-line; word-break: break-word; }
.lbl-track { display: flex; justify-content: space-between; gap: 2mm; padding: 1.5mm 3mm; border-bottom: 0.4mm solid #000; font-size: 1em; }
.lbl-track b { font-family: ui-monospace, Consolas, monospace; font-size: 1.15em; }
.lbl-items { padding: 1.8mm 3mm; font-size: .82em; }
.lbl-items-title { font-weight: 700; display: flex; justify-content: space-between; gap: 2mm; margin-bottom: .8mm; }
.lbl-warn { border: 0.3mm solid #000; padding: 0 1.5mm; }
.lbl-items li { display: flex; gap: 1.5mm; line-height: 1.3; }
.lbl-qty { flex: none; width: 7mm; font-weight: 700; }
.lbl-item { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
.lbl-more { font-style: italic; }
.lbl-note { margin-top: 1mm; padding: .8mm 1.5mm; border: 0.3mm dashed #000; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lbl-foot { display: flex; justify-content: space-between; padding: 1mm 3mm; border-top: 0.3mm solid #000; font-size: .72em; }
@media print {
  html, body { background: #fff !important; }
  .label-stack { display: block; gap: 0; }
  .ship-label { box-shadow: none; ${thermal ? "border: none; height: 149mm;" : ""} }
  ${thermal ? ".ship-label { break-after: page; page-break-after: always; } .ship-label:last-child { break-after: auto; page-break-after: auto; }" : ".label-sheet { break-after: page; page-break-after: always; } .label-sheet:last-child { break-after: auto; page-break-after: auto; }"}
}
`;
}
