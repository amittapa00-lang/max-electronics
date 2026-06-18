"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadSlip from "./UploadSlip";

import ThailandAddress from "./ThailandAddress";


export default function ConfirmOrderForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [zipcode, setZipcode] = useState("");

  const [note, setNote] = useState("");
  const [slip, setSlip] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!slip) {
      alert(
        "กรุณาอัปโหลดสลิปก่อนยืนยันคำสั่งซื้อ"
      );
      return;
    }

    const fullAddress = `
${address}
ตำบล/แขวง ${subdistrict}
อำเภอ/เขต ${district}
จังหวัด ${province}
${zipcode}
`;

    const res = await fetch(
      "/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address: fullAddress,
          note,
          slip,
        }),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.error ||
          "เกิดข้อผิดพลาด"
      );
      return;
    }

    alert("สั่งซื้อสำเร็จ");

    router.push(
      `/orders/${data.orderId}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="ชื่อผู้รับ"
        required
        className="w-full border p-3 rounded-xl"
      />

      <input
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        placeholder="เบอร์โทร"
        required
        className="w-full border p-3 rounded-xl"
      />

      <textarea
        value={address}
        onChange={(e) =>
          setAddress(e.target.value)
        }
        placeholder="เลขที่ บ้าน อาคาร ซอย ถนน"
        required
        className="w-full border p-3 rounded-xl h-28"
      />

     <ThailandAddress
  onChange={(data) => {
    setProvince(
      data.province
    );

    setDistrict(
      data.district
    );

    setSubdistrict(
      data.subdistrict
    );

    setZipcode(
      data.zipcode
    );
  }}
/>

      <textarea
        value={note}
        onChange={(e) =>
          setNote(e.target.value)
        }
        placeholder="หมายเหตุ"
        className="w-full border p-3 rounded-xl h-24"
      />

      <div className="border rounded-xl p-4">
        <p className="font-bold mb-3">
          📎 แนบสลิปการโอนเงิน
        </p>

        <UploadSlip
          onUploaded={setSlip}
        />
      </div>

      <button
        type="submit"
        className="
          w-full
          bg-green-600
          hover:bg-green-700
          text-white
          py-3
          rounded-xl
          font-bold
        "
      >
        ยืนยันคำสั่งซื้อ
      </button>
    </form>
  );
}