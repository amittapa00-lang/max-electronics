import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageOff, Pencil } from "lucide-react";
import ConfirmOrderForm from "@/components/ConfirmOrderForm";
import BankTransferCard from "@/components/BankTransferCard";
import CheckoutSteps from "@/components/CheckoutSteps";
import { calcShippingFee } from "@/lib/shipping";

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

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calcShippingFee(itemCount);
  const grandTotal = total + shippingFee;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <CheckoutSteps step={2} />
      <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900">ที่อยู่จัดส่งและชำระเงิน</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ซ้าย: ฟอร์ม */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 order-2 lg:order-1">
          <ConfirmOrderForm />
        </div>

        {/* ขวา: สรุปยอด + บัญชี */}
        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">รายการสินค้า ({itemCount} ชิ้น)</h2>
              <Link href="/cart" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                <Pencil className="h-3.5 w-3.5" /> แก้ไข
              </Link>
            </div>

            <ul className="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {cartItems.map((item) => {
                const img = item.product.images?.[0]?.imageUrl;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.product.name} className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <span className="absolute right-0 top-0 min-w-5 rounded-bl-md bg-slate-900 px-1 text-center text-[11px] font-bold leading-5 text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-400">฿{item.product.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ราคาสินค้า</dt>
                <dd className="text-slate-900">฿{total.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ค่าจัดส่ง ({itemCount} ชิ้น)</dt>
                <dd className="text-slate-900">฿{shippingFee.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">ยอดชำระ</span>
              <span className="text-2xl font-bold text-brand-600">฿{grandTotal.toLocaleString()}</span>
            </div>
            <p className="mt-0.5 text-right text-xs text-slate-400">รวม VAT แล้ว</p>
          </div>

          <BankTransferCard amount={grandTotal} />
        </div>
      </div>
    </main>
  );
}
