import AddStaticpages from "@/components/page/staticpageModule/addStaticpages";
import React from "react";

export default function page({params}) {
  return <AddStaticpages id={params.id}/>;
}
