"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminShippingForm({
  orderId,
}: {
  orderId: number;
}) {
  const router = useRouter();

  const [shippingCompany, setShippingCompany] =
    useState("Flash Express");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  async function saveTracking() {
    const res = await fetch(
      `/api/admin/orders/${orderId}/tracking`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          shippingCompany,
          trackingNumber,
        }),
      }
    );

    if (res.ok) {
      alert("บันทึกสำเร็จ");
      router.refresh();
    } else {
      alert("บันทึกไม่สำเร็จ");
    }
  }

  return (
    <div className="border rounded-xl p-6 mt-8">

      <h2 className="text-xl font-bold mb-4">
        🚚 ข้อมูลการจัดส่ง
      </h2>

      <select
        value={shippingCompany}
        onChange={(e) =>
          setShippingCompany(
            e.target.value
          )
        }
        className="w-full border p-3 rounded-lg mb-4"
      >
        <option>
          Flash Express
        </option>

        <option>
          Kerry Express
        </option>

        <option>
          J&T Express
        </option>

        <option>
          Thailand Post
        </option>
      </select>

      <input
        type="text"
        placeholder="เลขพัสดุ"
        value={trackingNumber}
        onChange={(e) =>
          setTrackingNumber(
            e.target.value
          )
        }
        className="w-full border p-3 rounded-lg mb-4"
      />

      <button
        onClick={saveTracking}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        บันทึกและจัดส่งสินค้า
      </button>

    </div>
  );
}