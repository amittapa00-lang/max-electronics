// lib/dateRange.ts
// ฟังก์ชันช่วยคำนวณช่วงวันที่ และจัดกลุ่มข้อมูล (bucket) สำหรับกราฟ
// รองรับ 4 ช่วง: day (วัน) / week (สัปดาห์) / month (เดือน) / year (ปี)

export type Period = "day" | "week" | "month" | "year";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfWeek(d: Date) {
  // ให้วันจันทร์เป็นวันแรกของสัปดาห์
  const day = d.getDay(); // 0 = อาทิตย์
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

/**
 * คำนวณ start/end (แบบ exclusive ที่ end) และ label ภาษาไทย
 * ของช่วงเวลาที่เลือก โดยอิงจาก dateParam (ถ้าไม่ส่งมาใช้วันปัจจุบัน)
 */
export function getPeriodRange(period: Period, dateParam?: string) {
  const now = dateParam ? new Date(dateParam) : new Date();

  if (period === "day") {
    const start = startOfDay(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      start,
      end,
      label: start.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }

  if (period === "week") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return {
      start,
      end,
      label: `${start.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      })} - ${lastDay.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`,
    };
  }

  if (period === "month") {
    const start = startOfMonth(now);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return {
      start,
      end,
      label: start.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      }),
    };
  }

  // year
  const start = startOfYear(now);
  const end = new Date(start.getFullYear() + 1, 0, 1);
  return { start, end, label: `ปี ${start.getFullYear() + 543}` };
}

export type Bucket = { key: string; label: string; total: number; count: number };

/** สร้างช่องกราฟเปล่าๆ ทั้งหมดในช่วง start-end เพื่อให้กราฟต่อเนื่อง (ไม่ขาดช่วงที่ไม่มีข้อมูล) */
export function generateEmptyBuckets(
  period: Period,
  start: Date,
  end: Date
): Bucket[] {
  const buckets: Bucket[] = [];

  if (period === "day") {
    for (let h = 0; h < 24; h++) {
      buckets.push({ key: String(h).padStart(2, "0"), label: `${h}:00`, total: 0, count: 0 });
    }
    return buckets;
  }

  if (period === "year") {
    for (let m = 0; m < 12; m++) {
      const d = new Date(start.getFullYear(), m, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(m + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("th-TH", { month: "short" }),
        total: 0,
        count: 0,
      });
    }
    return buckets;
  }

  // week หรือ month -> รายวัน
  const cursor = new Date(start);
  while (cursor < end) {
    buckets.push({
      key: cursor.toISOString().slice(0, 10),
      label: cursor.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      total: 0,
      count: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return buckets;
}

function keyForDate(d: Date, period: Period) {
  if (period === "day") return String(d.getHours()).padStart(2, "0");
  if (period === "year") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return d.toISOString().slice(0, 10);
}

/**
 * จัดกลุ่มรายการ (orders / page views ฯลฯ) ลงในช่องกราฟ ตามช่วงเวลาที่เลือก
 * items ต้องมี createdAt: Date, และ valueFn คืนค่าตัวเลขที่จะรวม (เช่น ยอดขาย หรือ 1 สำหรับนับจำนวน)
 */
export function bucketItems<T extends { createdAt: Date }>(
  items: T[],
  period: Period,
  start: Date,
  end: Date,
  valueFn: (item: T) => number
): Bucket[] {
  const buckets = generateEmptyBuckets(period, start, end);
  const map = new Map(buckets.map((b) => [b.key, b]));

  for (const item of items) {
    const key = keyForDate(item.createdAt, period);
    const bucket = map.get(key);
    if (bucket) {
      bucket.total += valueFn(item);
      bucket.count += 1;
    }
  }

  return buckets;
}