import QuoteStatus from "@/components/QuoteStatus";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  const isJuristic = quote.customerType === "juristic";

  const fullAddress = [
    quote.address,
    quote.subDistrict && `ตำบล/แขวง${quote.subDistrict}`,
    quote.district && `อำเภอ${quote.district}`,
    quote.province,
    quote.zipCode,
  ]
    .filter(Boolean)
    .join(" ");

  const statusMap = {
    PENDING: {
      text: "🟡 รอดำเนินการ",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    PROCESSING: {
      text: "🔵 กำลังจัดทำใบเสนอราคา",
      className: "bg-blue-50 text-blue-700 ring-blue-200",
    },
    EMAILED: {
      text: "🟢 ส่งอีเมลแล้ว",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    COMPLETED: {
      text: "✅ ปิดงาน",
      className: "bg-green-50 text-green-700 ring-green-200",
    },
    CANCELLED: {
      text: "❌ ยกเลิก",
      className: "bg-red-50 text-red-700 ring-red-200",
    },
  };

  const status =
    statusMap[quote.status as keyof typeof statusMap] ?? statusMap.PENDING;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              คำขอใบเสนอราคา
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              ใบเสนอราคา #{quote.id}
            </h1>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${status.className}`}
          >
            {status.text}
          </span>
        </div>

        {/* การ์ดจัดการสถานะ */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <QuoteStatus id={quote.id} currentStatus={quote.status} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ซ้าย: ข้อมูลลูกค้า */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  👤
                </span>
                <h2 className="text-base font-semibold text-slate-900">
                  ข้อมูลลูกค้า
                </h2>
              </div>

              {quote.customerType && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    isJuristic
                      ? "bg-violet-50 text-violet-700 ring-violet-200"
                      : "bg-sky-50 text-sky-700 ring-sky-200"
                  }`}
                >
                  {isJuristic ? "นิติบุคคล" : "บุคคลธรรมดา"}
                </span>
              )}
            </div>

            <dl className="divide-y divide-slate-100">
              {isJuristic ? (
                <>
                  <div className="grid grid-cols-3 gap-2 py-3 first:pt-0">
                    <dt className="text-sm text-slate-500">ชื่อบริษัท</dt>
                    <dd className="col-span-2 text-sm font-semibold text-slate-900">
                      {quote.businessName || quote.companyName}
                    </dd>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3">
                    <dt className="text-sm text-slate-500">เลขผู้เสียภาษี</dt>
                    <dd className="col-span-2 font-mono text-sm text-slate-700">
                      {quote.taxId || "-"}
                    </dd>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-3 gap-2 py-3 first:pt-0">
                  <dt className="text-sm text-slate-500">บริษัท</dt>
                  <dd className="col-span-2 text-sm font-semibold text-slate-900">
                    {quote.companyName}
                  </dd>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 py-3">
                <dt className="text-sm text-slate-500">ผู้ติดต่อ</dt>
                <dd className="col-span-2 text-sm font-semibold text-slate-900">
                  {quote.firstName || quote.lastName
                    ? `${quote.firstName ?? ""} ${quote.lastName ?? ""}`.trim()
                    : quote.contactName}
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3">
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="col-span-2 text-sm text-slate-700">
                  <a
                    href={`mailto:${quote.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {quote.email}
                  </a>
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3">
                <dt className="text-sm text-slate-500">โทรศัพท์</dt>
                <dd className="col-span-2 text-sm text-slate-700">
                  <a
                    href={`tel:${quote.phone}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {quote.phone}
                  </a>
                </dd>
              </div>

              {fullAddress && (
                <div className="grid grid-cols-3 gap-2 py-3">
                  <dt className="text-sm text-slate-500">ที่อยู่</dt>
                  <dd className="col-span-2 text-sm text-slate-700">
                    {fullAddress}
                  </dd>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 py-3">
                <dt className="text-sm text-slate-500">จำนวน</dt>
                <dd className="col-span-2 text-sm font-semibold text-slate-900">
                  {quote.quantity.toLocaleString()} ชิ้น
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 last:pb-0">
                <dt className="text-sm text-slate-500">หมายเหตุ</dt>
                <dd className="col-span-2 text-sm text-slate-700">
                  {quote.note || (
                    <span className="text-slate-400">ไม่มีหมายเหตุ</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* ขวา: สินค้า */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                📦
              </span>
              <h2 className="text-base font-semibold text-slate-900">สินค้า</h2>
            </div>

            {quote.product.images.length > 0 && (
              <Image
                src={quote.product.images[0].imageUrl}
                alt={quote.product.name}
                width={450}
                height={450}
                className="mb-5 aspect-square w-full rounded-xl border border-slate-200 object-cover"
              />
            )}

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">ชื่อสินค้า</div>
                <div className="text-base font-semibold text-slate-900">
                  {quote.product.name}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">รหัสสินค้า</div>
                <div className="font-mono text-sm text-slate-700">
                  {quote.product.productCode || "-"}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">ราคา</div>

                {quote.product.quotationOnly ? (
                  <div className="text-xl font-bold text-amber-600">
                    ขอใบเสนอราคา
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-indigo-600">
                    ฿ {quote.product.price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}