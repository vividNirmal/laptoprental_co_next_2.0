import AddBlogCategory from "@/components/page/staticpageModule/addBlogCategory";
import React from "react";

export default function page({params}) {
  return <AddBlogCategory id = {params.id}/>;
}
