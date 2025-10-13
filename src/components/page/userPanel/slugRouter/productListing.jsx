"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function ProductListing({ data }) {
  const router = useRouter();

  const handleProductDetailRedirect = (data) => {
    const productName = data?.product_name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const productSlug = `pro-${productName}-${data?.unique_id}`;

    router.push(`/${productSlug}`);
  };
  return (
    <ul className="list-none grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
      {data?.products?.data.map((product, index) => (
        <li className="flex flex-col" key={index}>
          <Button
          variant="ghost"
            className="h-auto 2xl:h-auto flex-col cursor-pointer shadow-xl bg-white rounded-md overflow-hidden p-2.5 md:p-4 xl:p-5 gap-x-3.5 sm:gap-x-6 grow hover:scale-103 active:scale-95 active:shadow-none"
            onClick={() => handleProductDetailRedirect(product)}
          >
            <div className="block w-full relative rounded-md overflow-hidden after:pt-[75%] xl:after:pt-[100%] after:block after:w-full">
              <Image
                alt={product.product_name}
                className="block max-w-full w-full h-full absolute top-0 left-0 object-cover "
                src={product.product_images[0] || "/assets/default-featured-image.png"}
                width={200}
                height={200}
              />
            </div>
            <div className="shrink w-full flex flex-col gap-y-2">
              <h3 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 ellips-2 ">
                {product.product_name}
              </h3>
              <p className="text-xs sm:text-xs text-gray-600">
                {product.product_price}
              </p>
            </div>
          </Button>
        </li>
      ))}
    </ul>
  );
}
