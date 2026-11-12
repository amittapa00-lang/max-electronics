"use client";

import { Printer } from "lucide-react";
import { btn } from "./ui";

export default function PrintButton({ label = "พิมพ์" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={btn.primary}>
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
