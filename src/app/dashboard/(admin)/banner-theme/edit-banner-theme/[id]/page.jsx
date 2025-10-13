import EditBannerThemeForm from "@/components/page/Bannerpage/editbannertheme";
import React from "react";

function Editbanner({ params }) {
  return <EditBannerThemeForm id={params.id}/>;
}

export default Editbanner;
