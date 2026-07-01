"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import thaiGeography from "@/data/thailand-geography.json";

type SubDistrict = { id: number; name: string; zip: number };
type District = { id: number; name: string; subDistricts: SubDistrict[] };
type Province = { id: number; name: string; districts: District[] };

const provinces = thaiGeography as Province[];

type CustomerType = "individual" | "juristic";

export default function QuoteForm({
  productId,
  productName,
  productCode,
}: {
  productId: number;
  productName: string;
  productCode: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [customerType, setCustomerType] =
    useState<CustomerType>("individual");

  // บุคคลธรรมดา / ผู้ติดต่อ
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // นิติบุคคล
  const [taxId, setTaxId] = useState("");
  const [businessName, setBusinessName] = useState("");

  // ที่อยู่ (ใช้ร่วมกันทั้งสองประเภท)
  const [address, setAddress] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subDistrictId, setSubDistrictId] = useState("");
  const [zipCode, setZipCode] = useState("");

  // รายละเอียดที่ต้องการ
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const selectedProvince = useMemo(
    () => provinces.find((p) => String(p.id) === provinceId),
    [provinceId]
  );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find((d) => String(d.id) === districtId),
    [selectedProvince, districtId]
  );

  function handleProvinceChange(value: string) {
    setProvinceId(value);
    setDistrictId("");
    setSubDistrictId("");
    setZipCode("");
  }

  function handleDistrictChange(value: string) {
    setDistrictId(value);
    setSubDistrictId("");
    setZipCode("");
  }

  function handleSubDistrictChange(value: string) {
    setSubDistrictId(value);
    const sd = selectedDistrict?.subDistricts.find(
      (s) => String(s.id) === value
    );
    setZipCode(sd ? String(sd.zip) : "");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();

    const payload = {
      productId,
      quantity: Number(quantity),
      note,

      customerType,

      // ผู้ติดต่อ
      firstName,
      lastName,
      phone,
      email,

      // นิติบุคคล
      taxId: customerType === "juristic" ? taxId : "",
      businessName: customerType === "juristic" ? businessName : "",

      // ที่อยู่
      address,
      province: selectedProvince?.name || "",
      district: selectedDistrict?.name || "",
      subDistrict:
        selectedDistrict?.subDistricts.find(
          (s) => String(s.id) === subDistrictId
        )?.name || "",
      zipCode,

      // เก็บชื่อให้เข้ากับฟิลด์เดิมของระบบ (companyName / contactName)
      companyName:
        customerType === "juristic" ? businessName : fullName,
      contactName: fullName,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("ส่งคำขอใบเสนอราคาเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
        router.push("/");
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับระบบได้ในขณะนี้");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder:text-gray-400";
  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ประเภทบุคคล / นิติบุคคล */}
      <div className="flex flex-col gap-3">
        <label className={labelClass}>ประเภทบุคคล / นิติบุคคล</label>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="customerType"
              checked={customerType === "individual"}
              onChange={() => setCustomerType("individual")}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800">บุคคลธรรมดา</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="customerType"
              checked={customerType === "juristic"}
              onChange={() => setCustomerType("juristic")}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800">นิติบุคคล</span>
          </label>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-gray-200 p-5 flex flex-col gap-4">
        {customerType === "juristic" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  เลขประจำตัวผู้เสียภาษีอากร
                </label>
                <input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="เลขประจำตัวผู้เสียภาษีอากร"
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>ชื่อบริษัท</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ชื่อบริษัท"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        {/* ที่อยู่ / จังหวัด */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>ที่อยู่</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ที่อยู่"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>จังหวัด</label>
            <select
              value={provinceId}
              onChange={(e) => handleProvinceChange(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">--กรุณาเลือก จังหวัด--</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* อำเภอ / ตำบล / รหัสไปรษณีย์ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>อำเภอ</label>
            <select
              value={districtId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              required
              disabled={!selectedProvince}
              className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
            >
              <option value="">--กรุณาเลือก อำเภอ--</option>
              {selectedProvince?.districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>ตำบล / แขวง</label>
            <select
              value={subDistrictId}
              onChange={(e) => handleSubDistrictChange(e.target.value)}
              required
              disabled={!selectedDistrict}
              className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
            >
              <option value="">--กรุณาเลือก ตำบล/แขวง--</option>
              {selectedDistrict?.subDistricts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>รหัสไปรษณีย์</label>
            <input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="รหัสไปรษณีย์"
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* ชื่อ / นามสกุล */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              ชื่อ (ไม่ต้องใส่คำนำหน้าชื่อ)
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้าชื่อ)"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>นามสกุล</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="นามสกุล"
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* เบอร์โทรศัพท์ / อีเมล */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เบอร์โทรศัพท์"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมล"
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* รายละเอียดสินค้าที่ต้องการ */}
      <div className="flex flex-col gap-4">
        <label className={labelClass}>รายละเอียดสินค้าที่ต้องการ</label>

        <div className="rounded-xl bg-slate-50 border border-gray-200 p-4">
          <p className="text-xs text-slate-500">สินค้า</p>
          <p className="font-bold text-lg">{productName}</p>

          <p className="text-xs text-slate-500 mt-3">รหัสสินค้า</p>
          <p className="font-semibold">{productCode || "-"}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>จำนวนที่ต้องการ</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>หมายเหตุ / Remarks</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      {/* ปุ่มส่ง */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold rounded-lg transition-all disabled:bg-gray-400"
      >
        {loading ? "กำลังส่งข้อมูล..." : "ส่งคำขอใบเสนอราคา / Submit Request"}
      </button>
    </form>
  );
}