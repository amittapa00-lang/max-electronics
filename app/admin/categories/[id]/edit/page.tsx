import { redirect } from "next/navigation";

// แก้ไขชื่อหมวดหมู่ทำได้ในหน้ารายการแล้ว — เก็บเส้นทางเดิมไว้ให้ลิงก์เก่ายังใช้ได้
export default function EditCategoryPage() {
  redirect("/admin/categories");
}
