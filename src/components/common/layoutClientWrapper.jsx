"use client";

import { usePathname } from "next/navigation";
import UserHeader from "../userHeader";
import { useSelector } from "react-redux";
import JsonLdScript from "@/components/JsonLdScript";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { userGetRequest } from "@/service/viewService";
import Image from "next/image";
import Head from "next/head";
import { X } from "lucide-react";

// Dynamic imports for non-critical components
const DynamicContactButton = lazy(() => import("../dynamicContactButton"));
const Footer = lazy(() => import("../page/footer"));
const UserBreadcrumbs = lazy(() => import("./userpanelBreadcrumd").then(module => ({ default: module.UserBreadcrumbs })));

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  const staticdata = useSelector((state) => state.setting);
  const shouldHide = pathname.startsWith("/dashboard");
  const bgColor =
    staticdata?.staticData?.theme_id?.body_background || "#9cc3D5";
  const footerBanner =
    staticdata?.banner?.ad_header_banners_data?.randomBanner?.banner_image;
  const sideBanner =
    staticdata?.banner?.ad_sidebar_banners_data?.randomBanner?.banner_image;

  const [showFooterBanner, setShowFooterBanner] = useState(false);

  const generateBreadcrumbStructuredData = (crumbs) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      name: "Breadcrumbs",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };
  };

  useEffect(() => {
    // Delay redirect check to not block initial render
    const timer = setTimeout(() => {
      Redirect();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (footerBanner) {
      const timer = setTimeout(() => {
        setShowFooterBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [footerBanner]);

  async function Redirect() {
    try {
      const url =
        `${window.location.protocol}//` +
        window.location.host +
        window.location.pathname;
      const responce = await userGetRequest(`check-redirect-url?from_url=${url}`);
      if (responce?.data?.to_url) {
        window.location.href = responce.data.to_url;
      }
    } catch (error) {
      console.error("Redirect check failed:", error);
    }
  }

  const breadcrumbSchemas = useMemo(() => {
    if (pathname === "/") return [];

    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [
      {
        name: "Home",
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://laptoprental.co"
          }/`,
      },
      ...parts.map((part, index) => {
        const url =
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://laptoprental.co"}/` +
          parts.slice(0, index + 1).join("/");

        return {
          name: decodeURIComponent(part.replace(/-/g, " ")),
          url,
        };
      }),
    ];

    return [
      {
        id: "breadcrumb-schema",
        data: generateBreadcrumbStructuredData(crumbs),
      },
    ];
  }, [pathname]);

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href={sideBanner || "/placeholder.svg"}
          fetchpriority="high"
        />
      </Head>
      {!shouldHide && <UserHeader />}
      {!shouldHide && (
        <Suspense fallback={null}>
          <DynamicContactButton pathName={pathname} />
        </Suspense>
      )}
      {!shouldHide && pathname != "/" && (
        <div className="px-3">
          <Suspense fallback={<div className="h-8 bg-gray-100 animate-pulse rounded" />}>
            <UserBreadcrumbs />
          </Suspense>
        </div>
      )}

      <section className="grow relative" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-wrap xl:flex-nowrap items-start justify-center 2xl:gap-4 py-6 xl:px-6 2xl:px-9 rz-app-wrap sm:rounded-xl">
          {sideBanner && (
            <div className="hidden xl:block shrink-0 2xl:w-1/8 w-16 grow 2xl:grow-0 sticky top-6 rounded-xl overflow-hidden before:pt-[600px] before:block">
              <Image 
                src={sideBanner || "/placeholder.svg"} 
                fill 
                className="absolute top-0 left-0 object-cover w-full h-full max-w-full" 
                alt="ads image" 
                loading="lazy"
                sizes="(max-width: 1280px) 64px, 12.5vw"
              />
            </div>
          )}
          <div className="container mx-auto w-full px-2.5">{children}</div>

          {sideBanner && (
            <div className="hidden xl:block shrink-0 2xl:w-1/8 w-16 grow 2xl:grow-0 sticky top-6 rounded-xl overflow-hidden before:pt-[600px] before:block"></div>
          )}
        </div>
        {!shouldHide && (
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <Footer />
          </Suspense>
        )}
      </section>

      {/* Inject structured data */}
      {breadcrumbSchemas.map((schema) => (
        <JsonLdScript key={schema.id} id={schema.id} data={schema.data} />
      ))}
      {footerBanner && (
        <div className={`fixed left-0 right-0 bottom-6 z-50 flex justify-center pointer-events-none transition-all duration-1000 ease-in-out ${
          showFooterBanner 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform translate-y-full opacity-0'
        }`}>
          <div className="w-full max-w-7xl pointer-events-auto">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => setShowFooterBanner(false)}
                aria-label="Close banner"
                className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="size-4 cursor-pointer" />
              </button>
              <div className="w-full h-32 md:h-40 overflow-hidden">
                <Image
                  src={footerBanner || "/placeholder.svg"}
                  className="block w-full h-full object-cover"
                  alt="ads image"
                  width={1300}
                  height={128}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1300px"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
