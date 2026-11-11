export default function CheckoutSteps({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["ตะกร้าสินค้า", "ที่อยู่และชำระเงิน", "สั่งซื้อสำเร็จ"];
  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 min-w-0">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? "bg-brand-600 text-white" : done ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={`truncate ${active ? "font-semibold text-slate-900" : "text-slate-500"}`}>{label}</span>
            {n < steps.length && <span className="hidden sm:block h-px flex-1 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}
