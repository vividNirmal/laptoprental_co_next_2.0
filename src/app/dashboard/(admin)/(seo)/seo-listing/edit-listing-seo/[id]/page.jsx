import EditListingseo from "@/components/page/Seo/editListingseo";
import React from "react";

export default function page({params}) {
  return <EditListingseo id = {params.id}/>;
}
