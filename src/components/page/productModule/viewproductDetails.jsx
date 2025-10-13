"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getRequest } from "@/service/viewService";

export default function ViewproductDetails({ id }) {
  const [product, setProduct] = useState([]);
  useEffect(() => {
    if (id) {
      fettchDetails();
    }
  }, [id]);
  async function fettchDetails() {
    const responce = await getRequest(`listing-product-details/${id}`);
    if (responce) {
      setProduct(responce.data.productDetails);
    }
  }
  function textConvert(text) {
    return text?.replace(/\s+/g, "_")?.toLowerCase() || "";
  }

  return (
    <div className="flex flex-col h-full grow overflow-auto p-4 2xl:p-5 pr-1.5">
      <div className="w-full max-h-full overflow-auto">
        <Table className="w-full align-middle caption-bottom border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead
                colSpan={2}
                className="bg-[#7367f0] text-white text-left text-base font-bold p-2 py-3 rounded-tr-xl rounded-tl-xl"
              >
                Product Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Product name
              </TableCell>
              <TableCell className="w-[75%] text-left">{product.product_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Product slug
              </TableCell>
              <TableCell className="w-[75%] text-left">
                {textConvert(product?.product_name)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Product Price
              </TableCell>
              <TableCell className="w-[75%] text-left">{product.product_price}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Description
              </TableCell>
              <TableCell className="w-[75%] text-left">
                <div dangerouslySetInnerHTML={{ __html: product.product_description }} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                scope="row"
                className="w-[25%] text-left border-b border-solid border-gray-200"
              >
                Product Images
              </TableCell>
              <TableCell className="w-[75%] p-2 border-b border-solid border-gray-200">
                <div className="flex items-center pt-5 pb-6 gap-2 flex-wrap">
                  {product?.product_images?.map((img, index) => (
                    <div key={index}>
                      <Image
                        alt={img}
                        className="object-cover rounded-xl h-24 w-24"
                        src={img || "/placeholder.svg"}
                        width={96}
                        height={96}
                      />
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Link href="/dashboard/manage-product" className="mt-6">
        <Button>Back</Button>
      </Link>
    </div>
  );
}
