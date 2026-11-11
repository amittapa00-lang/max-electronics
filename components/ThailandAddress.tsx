"use client";

import { useEffect, useMemo, useState } from "react";

type Province = {
id: number;
name_th: string;
};

type District = {
id: number;
name_th: string;
province_id: number;
};

type SubDistrict = {
id: number;
name_th: string;
district_id: number;
zip_code: number;
};

type Props = {
onChange: (data: {
province: string;
district: string;
subdistrict: string;
zipcode: string;
}) => void;
};

export default function ThailandAddress({
onChange,
}: Props) {
const [provinces, setProvinces] =
useState<Province[]>([]);

const [districts, setDistricts] =
useState<District[]>([]);

const [subDistricts, setSubDistricts] =
useState<SubDistrict[]>([]);

const [province, setProvince] =
useState("");

const [district, setDistrict] =
useState("");

const [subdistrict, setSubdistrict] =
useState("");

useEffect(() => {
async function loadData() {
try {
const [
provincesRes,
districtsRes,
subdistrictsRes,
] = await Promise.all([
fetch(
"/thailand/provinces.json"
),
fetch(
"/thailand/districts.json"
),
fetch(
"/thailand/sub_districts.json"
),
]);


    setProvinces(
      await provincesRes.json()
    );

    setDistricts(
      await districtsRes.json()
    );

    setSubDistricts(
      await subdistrictsRes.json()
    );
  } catch (err) {
    console.error(err);
  }
}

loadData();


}, []);

const selectedProvince =
provinces.find(
(p) =>
p.name_th === province
);

const filteredDistricts =
districts.filter(
(d) =>
d.province_id ===
selectedProvince?.id
);

const selectedDistrict =
filteredDistricts.find(
(d) =>
d.name_th === district
);

const filteredSubDistricts =
subDistricts.filter(
(s) =>
s.district_id ===
selectedDistrict?.id
);

const zipcode = useMemo(() => {
const found =
filteredSubDistricts.find(
(s) =>
s.name_th ===
subdistrict
);

return found
  ? String(
      found.zip_code
    )
  : "";


}, [
subdistrict,
filteredSubDistricts,
]);

useEffect(() => {
onChange({
province,
district,
subdistrict,
zipcode,
});
}, [
province,
district,
subdistrict,
zipcode,
onChange,
]);

return ( <div className="grid sm:grid-cols-2 gap-3">
<select
value={province}
onChange={(e) => {
setProvince(
e.target.value
);
setDistrict("");
setSubdistrict("");
}}
className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
> <option value="">
เลือกจังหวัด </option>


    {provinces.map(
      (item) => (
        <option
          key={item.id}
          value={
            item.name_th
          }
        >
          {item.name_th}
        </option>
      )
    )}
  </select>

  <select
    value={district}
    onChange={(e) => {
      setDistrict(
        e.target.value
      );
      setSubdistrict("");
    }}
    disabled={!province}
    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
  >
    <option value="">
      เลือกอำเภอ / เขต
    </option>

    {filteredDistricts.map(
      (item) => (
        <option
          key={item.id}
          value={
            item.name_th
          }
        >
          {item.name_th}
        </option>
      )
    )}
  </select>

  <select
    value={subdistrict}
    onChange={(e) =>
      setSubdistrict(
        e.target.value
      )
    }
    disabled={!district}
    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
  >
    <option value="">
      เลือกตำบล / แขวง
    </option>

    {filteredSubDistricts.map(
      (item) => (
        <option
          key={item.id}
          value={
            item.name_th
          }
        >
          {item.name_th}
        </option>
      )
    )}
  </select>

  <input
    value={zipcode}
    readOnly
    placeholder="รหัสไปรษณีย์"
    className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
  />
</div>

);
}
