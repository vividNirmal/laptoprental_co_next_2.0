import AddFaqtForm from "@/components/page/Faq/addfaq";
import React from "react";

export default function page({ params }) {
  return <AddFaqtForm id={params.id}/>;
}
