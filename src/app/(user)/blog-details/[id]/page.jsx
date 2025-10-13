import BlogDetailsPage from "@/components/page/userPanel/Blogs/BlogDetailsPage";
import { headers } from "next/headers";
import { getMetaDetails } from "@/lib/getMetaDetails";
import { getRequest } from "@/service/serverService";

export async function generateMetadata({ params }) {
  const { id } = params;
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host");
  const currentUrl = `${protocol}://${host}/blog-details/${id}`;

  const meta = await getMetaDetails("blog", id, currentUrl);

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

// Force dynamic rendering - no cache, real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogDetails({ params }) {
  return <BlogDetailsPage id={params.id} />;
}
