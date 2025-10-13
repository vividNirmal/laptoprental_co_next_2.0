
import AddBannerForm from "@/components/page/Bannerpage/addBanner";
import React from "react";

function UpdateBannertype({ params }) {
  return <AddBannerForm id={params.id} />;
}

export default UpdateBannertype;
