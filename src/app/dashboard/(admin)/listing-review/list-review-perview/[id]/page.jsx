import ListingDetailview from "@/components/page/ListingReview/listingDetailview";
import React from "react";

export default function page({params}) {
  return <ListingDetailview id = {params.id}/>;
}
