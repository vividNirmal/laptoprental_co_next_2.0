import AddBlog from "@/components/page/staticpageModule/addblog";
import React from "react";

export default function page({params}) {
  return <AddBlog id={params.id}/>;
}
