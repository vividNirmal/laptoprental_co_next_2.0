"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductDetails({ data }) {
  const product = data?.product_details;
  const [mapurl, setMapUrl] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN;
  const generateListingSlug = (data) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric chars with dashes
      .replace(/-+/g, "-"); // Collapse multiple dashes into one

    return `${slug}-${data?.listing_unique_id}`;
  };

  useEffect(() => {
    const address = data?.listing_details?.area_id
      ? data?.listing_details?.area_id?.name
      : data?.listing_details?.address;
    const encoded = encodeURIComponent(address);
    const rawUrl = `https://maps.google.com/maps?q=${encoded}&output=embed`;
    setMapUrl(rawUrl);
  }, [data]);

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="w-2/4 flex flex-wrap gap-4 grow">
        <div className="w-full lg:w-5/12 grow">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            {/* <div className="relative after:block after:pt-[56.25%]">
              <Image
                alt="product img"
                className="absolute inset-0 w-full h-full object-contain"
                src={
                  product?.product_images[0] ||
                  "/placeholder.svg?height=300&width=500&query=product image"
                }
                width={500}
                height={300}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Button
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
                disabled
              >
                <ArrowLeft className="size-4 2xl:size-5" />
              </Button>
              <div className="flex items-center max-w-full overflow-auto gap-2 w-full">                
              </div>
              <Button
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
                disabled
              >
                <ArrowRight className="shrink-0 size-4 2xl:size-4" />
              </Button>
            </div> */}
            <Carousel className="w-full">
              <CarouselContent>
                {product?.product_images.map((item, index) => (
                  <CarouselItem key={index}>
                    <Card className={'p-0 2xl:p-0'}>
                      <CardContent className="relative">
                        <div className="relative before:pt-[56.25%] before:block rounded-lg overflow-hidden">

                          <Image
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover absolute top-0 left-0 max-w-full" // Adjusted styling for better fit
                          src={
                            `${baseUrl}/${item}` ||
                            "/placeholder.svg?height=300&width=300"
                          }
                          width={500}
                          height={300}
                        />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className={'-left-2.5'} />
              <CarouselNext className={'-right-2.5'} />
            </Carousel>
            <div className="mt-2 pt-2 md:mt-4 md:pt-4 border-t border-solid border-gray-200">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-800 mb-1 md:mb-1.5">
                {product.product_name}{" "}
              </h1>
              <div
                className="break-words [&>h3]:text-xl [&>h3]:mb-3 [&>h3]:font-semibold [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-4 [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs [&>p]:mb-2.5 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>p]:sm:mb-3 [&>p]:lg:mb-4"
                dangerouslySetInnerHTML={{
                  __html: product?.product_description,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/3">
        <div className="bg-white rounded-2xl p-4 shadow-lg overflow-hidden mb-4">
          <div className="bg-gray-600 text-lg lg:text-xl font-semibold text-white p-2.5 lg:p-4 text-center rounded-md mb-3 shadow-lg">
            {" "}
            Start ₹{" "}
            <span className="text-yellow-400">{product.product_price}</span>
          </div>
          <span className="text-base lg:text-lg font-medium block text-gray-600">
            {" "}
            {product.product_name}{" "}
          </span>
          <div className="flex flex-wrap gap-3">
            <Button
              className="w-5/12 grow px-3 py-2 rounded-md text-center text-white font-semibold text-xs lg:text-base cursor-pointer bg-[#007bff] animate-pulse transition-all duration-200 ease-linear hover:scale-103 active:scale-95 active:shadow-none"
              asChild
            >
              <Link href={"tel:+91" + product?.phone_number}>Call Us</Link>
            </Button>
            <Button
              className="w-5/12 grow px-3 py-2 rounded-md text-center text-white font-semibold text-xs lg:text-base cursor-pointer bg-[#9cc3D5] hover:scale-103 active:scale-95 active:shadow-none"
              asChild
            >
              <a href={data?.listing_details?.website}>Visit Site</a>
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <div className="bg-gray-200 text-gray-700 text-lg font-medium p-2.5 px-4 capitalize">
            {" "}
            listing description{" "}
          </div>
          <div className="flex flex-wrap gap-3 p-4">
            <div className="size-10">
              <Image
                alt="product img"
                className="size-full max-w-full block"
                src={
                  data?.listing_details?.listing_image ||
                  "/placeholder.svg?height=40&width=40&query=related product image"
                }
                width={40}
                height={40}
              />
            </div>
            <div className="w-5/12 grow pl-3">
              <a href={generateListingSlug(data?.listing_details)}>
                <h2 className="text-base font-semibold text-gray-800">
                  {" "}
                  {data?.listing_details.name}{" "}
                </h2>
              </a>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gray-200 text-gray-700 text-lg font-medium p-2.5 px-4">
            {" "}
            Posted In{" "}
          </div>
          <div className="p-4">
            <span className="text-xs lg:text-base font-medium text-gray-600 block mb-3">
              <h3>{product.location}</h3>
            </span>
            <div className="rounded-xl overflow-hidden">
              <iframe
                width="100%"
                height={450}
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                src={mapurl ? mapurl : "/"}
                title="Google Maps Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
