"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // เพิ่มบรรทัดนี้: เพื่อสั่งให้หน้าจอโหลดข้อมูลใหม่จาก Server
        router.refresh(); 
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline">
      ลบ
    </button>
  );
}