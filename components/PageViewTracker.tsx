"use client";

// components/PageViewTracker.tsx
// วางไว้ใน app/layout.tsx (ครั้งเดียว ระดับ root) เพื่อนับยอดเข้าชมทุกหน้า
// ตัวอย่าง:
//   import PageViewTracker from "@/components/PageViewTracker";
//   ...
//   <body>
//     <PageViewTracker />
//     {children}
//   </body>

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // เงียบไว้ ไม่ต้องให้ user เห็น error จากการนับสถิติ
    });
  }, [pathname]);

  return null;
}