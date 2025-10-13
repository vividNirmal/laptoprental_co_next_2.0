import MainRoute from "@/components/page/userPanel/slugRouter/mainRoute";
import React from "react";
import { headers } from "next/headers";
import { getMetaDetails } from "@/lib/getMetaDetails";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const id = resolvedParams.id;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host");
  const pathname = `/${slug}/${id}`;
  const currentUrl = `${protocol}://${host}${pathname}`;
  const slugForApi = `${slug}/${id}`; 

  const meta = await getMetaDetails("slug", slugForApi, currentUrl);

  return {
    title: meta?.meta_title || "MacBook Rental",
    description: meta?.meta_description,
    keywords: meta?.meta_keywords?.split(","),
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

export default async function page({params}) {
     const { id,slug } = await params
  return <MainRoute slug={slug} id={id}/>;
}
