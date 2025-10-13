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
import moment from "moment";
export default function ViewPremiumDetails({ id }) {
  const [product, setProduct] = useState([]);
  useEffect(() => {
    if (id) {
      fettchDetails();
    }
  }, [id]);
  async function fettchDetails() {
    const responce = await getRequest(`get-premium-listing-details/${id}`);
    if (responce) {
      setProduct(responce.data.Listing_details);
    }
  }
  function textConvert(text) {
    return text?.replace(/\s+/g, "_")?.toLowerCase() || "";
  }
  const dateFormat = (data) => {
    return moment(data).format("DD-MM-YYYY");
  };
  return (
    <div className="p-4 pr-1.5 2xl:p-5 bg-gray-50 min-h-full flex flex-col grow">
        <div className="flex flex-col h-full grow overflow-auto p-4 2xl:p-5 pr-1.5">

          <div className="w-full max-h-full overflow-auto">
            <Table className="w-full align-middle caption-bottom border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="bg-[#7367f0] text-white text-left text-base font-bold p-2 py-3 rounded-tr-xl rounded-tl-xl">Premium Listing Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell scope="row" className="w-[25%] text-left">Name</TableCell>
                  <TableCell className="w-[75%] text-left">{product.listing_id?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    scope="row"
                    className="w-[25%] text-left"
                  >
                    Premium Type
                  </TableCell>
                  <TableCell className="w-[75%] text-left">
                    {product?.premium_type}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    scope="row"
                    className="w-[25%] text-left"
                  >
                   Starting Date
                  </TableCell>
                  <TableCell className="w-[75%] text-left">
                    {product.start_date ? dateFormat(product.start_date) : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    scope="row"
                    className="w-[25%] text-left"
                  >
                    Ending Date
                  </TableCell>
                  <TableCell className="w-[75%] text-left">
                    {product.end_date ? dateFormat(product.end_date) : '-'}

                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Link href="/dashboard/premium-listing" className="mt-6">
            <Button>Back</Button>
          </Link>
        </div>
    </div>
  );
}
