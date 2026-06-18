"use client";

import { useState } from "react";

type ProductImage = {
  id: number;
  imageUrl: string;
};

export default function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] =
    useState(
      images?.[0]?.imageUrl ||
      "/uploads/no-image.jpg"
    );

  return (
    <div>
      <img
        src={selectedImage}
        alt={productName}
        className="
          w-full
          rounded-xl
          border
          object-cover
        "
      />

      <div className="flex gap-3 mt-4 flex-wrap">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.imageUrl}
            alt={productName}
            onClick={() =>
              setSelectedImage(
                img.imageUrl
              )
            }
            className="
              w-24
              h-24
              object-cover
              border
              rounded-lg
              cursor-pointer
              hover:scale-105
              transition
            "
          />
        ))}
      </div>
    </div>
  );
}