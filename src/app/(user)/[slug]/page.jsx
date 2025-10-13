import MainRoute from "@/components/page/userPanel/slugRouter/mainRoute";
import React from "react";
import { headers } from "next/headers";
import { getMetaDetails } from "@/lib/getMetaDetails";
import { userGetRequest } from "@/service/viewService";
import { getRequest } from "@/service/serverService";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host");
  const pathname = `/${slug}`;
  const currentUrl = `${protocol}://${host}${pathname}`;

  const meta = await getMetaDetails("slug", slug, currentUrl);

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

// Remove generateStaticParams for dynamic rendering
// This enables real-time data fetching on each request

// Force dynamic rendering - no cache, real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function page({ params }) {
  const { slug } = await params;
  
  // Fetch fresh data on every request - reflects admin changes immediately
  const respnce = await getRequest(
    `/get-listing-details-data?url_slug=${slug}`
  );
  
  return <MainRoute slug={slug} slugData={respnce?.data} />;
}
