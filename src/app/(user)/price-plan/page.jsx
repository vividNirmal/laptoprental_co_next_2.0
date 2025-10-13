import PricePlanPage from "@/components/page/userPanel/PricePlanPage/pricePlanPage";
import React from "react";
import { getMetaDetails } from "@/lib/getMetaDetails";
import { headers } from "next/headers";

export async function generateMetadata() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host");
  const pathname = "/price-plan";
  const currentUrl = `${protocol}://${host}${pathname}`;

  const meta = await getMetaDetails("price-plan", "price-plan", currentUrl);

  return {
    title: meta?.page_title || "MacBook Rental",
    description: meta?.meta_description,
    keywords: meta?.meta_keywords?.split(",") || [],
    openGraph: {
      title: meta?.ogTitle,
      description: meta?.ogDescription,
      images: meta?.ogImage ? [{ url: meta.ogImage }] : [],
      url: meta?.canonical || currentUrl,
    },
    alternates: {
      canonical: meta?.canonical || currentUrl,
    },
  };
}

export default async function PricePlan() {
  return <PricePlanPage />;
}
