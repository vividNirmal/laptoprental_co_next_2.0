import AddBannerTypeForm from "@/components/page/Bannerpage/addbannertype";
import React from "react";

function UpdateBannertype({ params }) {
  return <AddBannerTypeForm id={params.id} />;
}

export default UpdateBannertype;
