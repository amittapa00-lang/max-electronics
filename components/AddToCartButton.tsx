"use client";

export default function AddToCartButton({
  productId,
}: {
  productId: number;
}) {
  async function addToCart() {
    const res = await fetch(
      "/api/cart",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      }
    );

    const data =
      await res.json();

    if (res.ok) {
      alert(
        "เพิ่มลงตะกร้าแล้ว"
      );
    } else {
      alert(
        data.error ||
          "เพิ่มสินค้าไม่สำเร็จ"
      );
    }
  }

  return (
    <button
      onClick={addToCart}
      className="
        mt-8
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-6
        py-3
        rounded-xl
        font-bold
        transition
      "
    >
      🛒 หยิบใส่ตะกร้า
    </button>
  );
}
