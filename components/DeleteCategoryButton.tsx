"use client";

export default function DeleteCategoryButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("ยืนยันการลบ ?")) {
          e.preventDefault();
        }
      }}
      className="
        px-4 py-2
        rounded-lg
        bg-red-50
        text-red-600
      "
    >
      🗑️ ลบ
    </button>
  );
}