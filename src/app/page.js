import { Suspense } from "react";
import LayoutClientWrapper from "@/components/common/layoutClientWrapper";
import { getMetaDetails } from "@/lib/getMetaDetails";
import { headers } from "next/headers";
import dynamic from "next/dynamic";

// Dynamically import CategoryListing to reduce initial bundle size
const CategoryListing = dynamic(() => 
  import("@/components/page/userPanel/CategoryListing/categoryListing"), 
  { 
    loading: () => (
      <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 gap-x-[3px] max-[360px]:gap-1">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="relative bg-gray-200 border border-[#E5E5E5] p-3 px-2 lg:p-5 shadow-lg animate-pulse"
          >
            <div className="size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square mx-auto bg-gray-300 rounded" />
            <div className="mt-1 md:mt-2 h-4 bg-gray-300 rounded mx-auto w-3/4" />
          </div>
        ))}
      </div>
    ),
    ssr: true
  }
);

export async function generateMetadata() {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const host = headersList.get("host");
    const pathname = "/";
    const currentUrl = `${protocol}://${host}${pathname}`;
    
    const meta = await getMetaDetails("homepage", "homepage", currentUrl);
    
    return {
      title: meta?.page_title || "MacBook Rental - Premium Laptop Rentals",
      description: meta?.meta_description || "MacBook Rental | Rent MacBook Pro & Air - Fast, Reliable, Affordable",
      keywords: meta?.meta_keywords?.split(",") || ["macbook rental", "laptop rental", "macbook pro", "macbook air"],
      openGraph: {
        title: meta?.ogTitle || "MacBook Rental - Premium Laptop Rentals",
        description: meta?.ogDescription || "MacBook Rental | Rent MacBook Pro & Air - Fast, Reliable, Affordable",
        images: meta?.ogImage ? [{ url: meta.ogImage }] : [],
        url: meta?.canonical || currentUrl,
        type: "website",
        siteName: "MacBook Rental",
      },
      twitter: {
        card: "summary_large_image",
        title: meta?.ogTitle || "MacBook Rental - Premium Laptop Rentals",
        description: meta?.ogDescription || "MacBook Rental | Rent MacBook Pro & Air",
      },
      alternates: {
        canonical: meta?.canonical || currentUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "MacBook Rental - Premium Laptop Rentals",
      description: "MacBook Rental | Rent MacBook Pro & Air - Fast, Reliable, Affordable",
    };
  }
}

// Optimize caching strategy
export const revalidate = 300; // 5 minutes

export default async function Home() {
  let meta;
  try {
    meta = await generateMetadata();
  } catch (error) {
    console.error("Error loading metadata:", error);
    meta = { title: "MacBook Rental" };
  }

  // Preload critical resources
  const preloadLinks = [
    <link key="preload-api" rel="preload" href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/home-page`} as="fetch" crossOrigin="anonymous" />,
    <link key="preload-placeholder" rel="preload" href="/placeholder.svg" as="image" fetchPriority="high" />,
  ];

  return (
    <>
      {preloadLinks}
      <LayoutClientWrapper>
      <Suspense
        fallback={
          <div className="rz-app-wrap sm:rounded-xl mx-auto flex flex-col gap-4 xl:flex-nowrap">
            <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 gap-x-[3px] max-[360px]:gap-1">
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="relative bg-gray-200 border border-[#E5E5E5] p-3 px-2 lg:p-5 shadow-lg animate-pulse rounded"
                >
                  <div className="size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square mx-auto bg-gray-300 rounded" />
                  <div className="mt-1 md:mt-2 h-4 bg-gray-300 rounded mx-auto w-3/4" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CategoryListing metadata={meta} />
      </Suspense>
    </LayoutClientWrapper>
    </>
  );
}
