"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  productCode: string | null;
  description: string;
  price: number;
  stock: number;

  images: {
    id: number;
    imageUrl: string;
  }[];

  category: {
    id: number;
    name: string;
  } | null;
};

type Category = {
  id: number;
  name: string;

  parent?: {
    id: number;
    name: string;
  } | null;
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [productCode, setProductCode] = useState(
    product.productCode || ""
  );
  const [description, setDescription] = useState(
    product.description
  );
  const [price, setPrice] = useState(
    product.price.toString()
  );
  const [stock, setStock] = useState(
    product.stock.toString()
  );

  const [categoryId, setCategoryId] =
  useState(
    product.category?.id.toString() || ""
  );

  const [images, setImages] =
  useState<File[]>([]);

const [currentImages, setCurrentImages] =
  useState(product.images);

  async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  const imageUrls =
  currentImages.map(
    (img) => img.imageUrl
  );

for (const image of images) {
  const formData = new FormData();

  formData.append(
    "file",
    image
  );

  const uploadRes = await fetch(
    "/api/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadData =
    await uploadRes.json();

  imageUrls.push(
    uploadData.imageUrl
  );
}

  const res = await fetch(
    `/api/products/${product.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
  name,
  productCode,
  description,
  price,
  stock,
  categoryId:
    Number(categoryId),
  images: imageUrls,
}),
    }
  );

  const data = await res.json();

  if (res.ok) {
    alert("แก้ไขสินค้าสำเร็จ");

    router.push(
      "/admin/products"
    );

    router.refresh();
  } else {
    alert(
      data.error ||
      "เกิดข้อผิดพลาด"
    );
  }
}

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        แก้ไขสินค้า
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="ชื่อสินค้า"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="รหัสสินค้า"
          value={productCode}
          onChange={(e) =>
            setProductCode(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="รายละเอียดสินค้า"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-lg h-40"
        />

        <input
          type="number"
          placeholder="ราคา"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          placeholder="จำนวนสินค้า"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value)
          }
          className="w-full border p-3 rounded-lg"
        />

     <select
  value={categoryId}
  onChange={(e) =>
    setCategoryId(e.target.value)
  }
  className="w-full border p-3 rounded-lg"
  required
>
  <option value="">
    เลือกหมวดหมู่
  </option>

  {categories
    .filter((cat) => !cat.parent)
    .map((parent) => (
      <optgroup
        key={parent.id}
        label={parent.name}
      >
        <option value={parent.id}>
          {parent.name}
        </option>

        {categories
          .filter(
            (cat) =>
              cat.parent?.id ===
              parent.id
          )
          .map((child) => (
            <option
              key={child.id}
              value={child.id}
            >
              └─ {child.name}
            </option>
          ))}
      </optgroup>
    ))}
</select>
 {currentImages.length > 0 && (
  <div>
    <p className="mb-3 text-sm font-medium text-gray-600">
      รูปปัจจุบัน
    </p>

    <div className="flex flex-wrap gap-4">

      {currentImages.map((img) => (
        <div
          key={img.id}
          className="relative"
        >
          <img
            src={img.imageUrl}
            alt={product.name}
            className="
              w-32
              h-32
              object-cover
              rounded-lg
              border
            "
          />

          <button
            type="button"
            onClick={() =>
              setCurrentImages(
                currentImages.filter(
                  (i) => i.id !== img.id
                )
              )
            }
            className="
              absolute
              -top-2
              -right-2
              w-7
              h-7
              rounded-full
              bg-red-600
              text-white
              font-bold
              shadow-lg
              hover:bg-red-700
            "
          >
            ×
          </button>
        </div>
      ))}

    </div>
  </div>
)}

        <input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) =>
    setImages(
      Array.from(
        e.target.files || []
      )
    )
  }
  className="w-full border p-3 rounded-lg"
/>

        {images.length > 0 && (
  <p className="text-green-600 text-sm">
    เลือกแล้ว {images.length} รูป
  </p>
)}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          บันทึกการแก้ไข
        </button>
      </form>
    </main>
  );
}