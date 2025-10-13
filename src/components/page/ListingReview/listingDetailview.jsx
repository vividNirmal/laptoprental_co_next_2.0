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

export default function ListingDetailview({ id }) {
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
    <div>
      <div className="w-full max-h-full overflow-auto">
        <Table className="w-full align-middle caption-bottom border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead
                colSpan={2}
                className="bg-[#7367f0] text-white text-left text-base font-bold p-2 py-3 rounded-tr-xl rounded-tl-xl"
              >
                Listing Name
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Product name
              </TableCell>
              <TableCell className="w-[75%] text-left">{product?.listing_id?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Email
              </TableCell>
              <TableCell className="w-[75%] text-left">
                {textConvert(product?.user_id?.email)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Rating
              </TableCell>
              <TableCell className="w-[75%] text-left">{product?.rating}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="w-[25%] text-left">
                Comment
              </TableCell>
              <TableCell className="w-[75%] text-left">{product?.comment}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                scope="row"
                className="w-[25%] text-left border-b border-solid border-gray-200"
              >
                Approved
              </TableCell>
              <TableCell className="w-[75%] p-2 border-b border-solid border-gray-200">
                {product?.isApproved ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Link href="/dashboard/listing-review" className="mt-6">
        <Button>Back</Button>
      </Link>
    </div>
  );
}
