"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { CategorySkeletonGrid, OptimizedLoader } from "@/components/LoadingComponents";
import { handleSetListingType } from "@/redux/listinDynamicrouter/Listing";
import {
  handleCategory,
  handlePageloader,
} from "@/redux/settingReducer/settinReducer";
import { userPostRequest } from "@/service/viewService";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CategoryListing({ metadata }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.setting.category);
  const staticdata = useSelector((state) => state.setting.staticData);
  const pageLoder = useSelector((state) => state.setting.pageLoader);
  const searchValue = useSelector((state) => state.setting.searchvalue);
  
  // ✅ FIX: Track if component is mounted on client
  const [isMounted, setIsMounted] = useState(false);

  // ✅ FIX: Set mounted after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleNavigate(url) {
    const path = new URL(url).pathname;
    let cleanedPath = path.startsWith("/api") ? path.slice(4) : path;
    const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
    return relativePath;
  }

  useEffect(() => {
    dispatch(handleSetListingType(null));
  }, [dispatch]);

  const fetchHomepage = useCallback(async () => {
    const formData = new FormData();
    const sessionLocationData = sessionStorage.getItem("location_data");
    const locationData = sessionLocationData
      ? JSON.parse(sessionLocationData)
      : null;
    formData.append(
      "current_location_id",
      locationData?.current_location_id || ""
    );
    
    try {
      const resHome = await userPostRequest("home-page", formData);
      if (resHome) {
        const sessionLocation = sessionStorage.getItem("location_data");
        if (!sessionLocation) {
          if (Object.keys(resHome?.data?.current_location || {}).length > 0) {
            sessionStorage.setItem(
              "location_data",
              JSON.stringify(resHome?.data?.current_location)
            );
          }
        }
        if (resHome.data?.home_page_category) {
          dispatch(handleCategory(resHome.data?.home_page_category));
        }
      }
    } catch (error) {
      console.error("Error fetching homepage:", error);
    } finally {
      dispatch(handlePageloader(false));
    }
  }, [dispatch]);

  useEffect(() => {
    // ✅ Only fetch on client after mount
    if (isMounted && (!categories || categories.length === 0)) {
      fetchHomepage();
    } else if (categories && categories.length > 0) {
      dispatch(handlePageloader(false));
    }
  }, [isMounted, categories, fetchHomepage, dispatch]);
  
  const Categorylayout = useMemo(() => {
    // Don't render on server or before data is ready
    if (!isMounted || !categories || categories.length === 0) {
      return null;
    }

    const layoutStyle = staticdata?.home_page_layout_style || "1";
    
    switch (layoutStyle) {
      case "1":
        return (
          <ul className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 gap-x-[3px] max-[360px]:gap-1">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative bg-white border border-[#E5E5E5] hover:border-[#9cc3D5] p-3 px-2 lg:p-5 before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl transform-gpu will-change-transform transition-transform duration-200 ease-linear hover:scale-105 active:scale-95"
                style={{ contain: 'layout style paint' }}
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer"
                >
                  <div className="relative size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square mx-auto">
                    <Image
                      src={
                        category.mobile_image ||
                        category.desktop_image ||
                        "/placeholder.svg"
                      }
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 40px, (max-width: 1024px) 64px, (max-width: 1280px) 80px, 112px"
                      className="object-contain"
                      loading={index < 8 ? "eager" : "lazy"}
                      priority={index < 4}
                      fetchPriority={index < 4 ? "high" : "low"}
                    />
                  </div>
                  <h2 className="mt-1 md:mt-2 text-xs max-[360px]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-[#313F48] whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "2":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-3 lg:gap-4">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative bg-white border border-[#E5E5E5] hover:border-[#9cc3D5] before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer"
                >
                  <div className="py-4">
                    <div className="py-5 relative size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square mx-auto">
                      <Image
                        src={
                          category.mobile_image ||
                          category.desktop_image ||
                          "/placeholder.svg"
                        }
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 40px, (max-width: 1024px) 64px, (max-width: 1280px) 80px, 112px"
                        className="object-contain"
                        loading={index < 12 ? "eager" : "lazy"}
                        priority={index < 6}
                      />
                    </div>
                  </div>
                  <h2 className="p-2 md:p-3 bg-blue-500 text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-white whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "3":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-2 lg:gap-3">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative bg-white border border-[#E5E5E5] hover:border-[#9cc3D5] p-2 lg:p-3 before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block bg-gray-100 cursor-pointer"
                >
                  <div className="py-4">
                    <picture className="py-5">
                      {category.desktop_image && (
                        <source
                          media="(min-width:570px)"
                          srcSet={category.desktop_image}
                        />
                      )}
                      <img
                        src={
                          category.mobile_image ||
                          category.desktop_image ||
                          "/placeholder.svg"
                        }
                        alt={category.name}
                        className="block mx-auto object-contain size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square"
                      />
                    </picture>
                  </div>
                  <h2 className="mt-2 md:mt-2 text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-black whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "4":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-2 lg:gap-3">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#9cc3D5] p-2 lg:p-3 before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block bg-gray-100 cursor-pointer"
                >
                  <div className="py-2">
                    <picture className="py-5">
                      {category.desktop_image && (
                        <source
                          media="(min-width:570px)"
                          srcSet={category.desktop_image}
                        />
                      )}
                      <img
                        src={
                          category.mobile_image ||
                          category.desktop_image ||
                          "/placeholder.svg"
                        }
                        alt={category.name}
                        className="block mx-auto object-contain size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square"
                      />
                    </picture>
                  </div>
                  <h2 className="mt-2 md:mt-2 p-1 md:p-2 bg-teal-400 rounded-full [@media(max-width:360px)]:text-[10px] sm:text-xs text-base text-center font-semibold text-white whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "5":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-2 lg:gap-3">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative mb-5 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#9cc3D5] p-2 lg:p-3 before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block bg-gray-100 cursor-pointer"
                >
                  <div className="py-2">
                    <picture className="py-5">
                      {category.desktop_image && (
                        <source
                          media="(min-width:570px)"
                          srcSet={category.desktop_image}
                        />
                      )}
                      <img
                        src={
                          category.mobile_image ||
                          category.desktop_image ||
                          "/placeholder.svg"
                        }
                        alt={category.name}
                        className="block mx-auto object-contain size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square"
                      />
                    </picture>
                  </div>
                  <h2 className="p-1 md:p-2 bg-lime-600 rounded-full text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs text-center font-semibold text-white whitespace-nowrap max-w-full text-ellipsis overflow-hidden absolute bottom-[-10px] sm:bottom-[-17px] w-[85%] left-0 right-0 mx-auto">
                    {category.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "6":
        return (
          <ul className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-6">
            {categories.map((category, index) => (
              <li key={category.id || index} className="relative">
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="cursor-pointer rounded-full bg-white aspect-square flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none transition-all duration-200 ease-linear"
                >
                  <picture className="p-2 lg:p-4 xl:p-5 size-full content-center">
                    {category.desktop_image && (
                      <source
                        media="(min-width:570px)"
                        srcSet={category.desktop_image}
                      />
                    )}
                    <img
                      src={
                        category.mobile_image ||
                        category.desktop_image ||
                        "/placeholder.svg"
                      }
                      alt={category.name}
                      className="mx-auto block object-contain aspect-square"
                    />
                  </picture>
                </Link>
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer"
                >
                  <h2 className="mt-1 md:mt-2 text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-black whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category?.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "7":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-3 lg:gap-4">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative bg-white border rounded-xl overflow-hidden border-[#E5E5E5] hover:border-[#9cc3D5] before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer"
                >
                  <div className="py-4 bg-gray-100">
                    <picture className="py-5">
                      {category.desktop_image && (
                        <source
                          media="(min-width:570px)"
                          srcSet={category.desktop_image}
                        />
                      )}
                      <img
                        src={
                          category.mobile_image ||
                          category.desktop_image ||
                          "/placeholder.svg"
                        }
                        alt={category.name}
                        className="block mx-auto object-contain size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square"
                      />
                    </picture>
                  </div>
                </Link>
                <h2 className="p-2 md:p-3 bg-white border-t-1 border-[#E5E5E5] text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-[#313F48] whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                  {category?.name}
                </h2>
              </li>
            ))}
          </ul>
        );
        
      case "8":
        return (
          <ul className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-6">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="relative shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="cursor-pointer rounded-full bg-white aspect-square flex items-center justify-center"
                >
                  <picture className="py-5">
                    {category.desktop_image && (
                      <source
                        media="(min-width:570px)"
                        srcSet={category.desktop_image}
                      />
                    )}
                    <img
                      src={
                        category.mobile_image ||
                        category.desktop_image ||
                        "/placeholder.svg"
                      }
                      alt={category.name}
                      className="block mx-auto object-contain size-12 sm:size-20 lg:size-20 xl:size-28 aspect-square"
                    />
                  </picture>
                </Link>
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="cursor-pointer block p-1 md:p-2 bg-indigo-500 rounded-full mt-[-25px]"
                >
                  <h2 className="text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-white whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category?.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "9":
        return (
          <ul className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-6">
            {categories.map((category, index) => (
              <li key={category.id || index} className="relative">
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="cursor-pointer rounded-tr-[50%] rounded-bl-[50%] bg-white aspect-square flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
                >
                  <picture className="py-5">
                    {category.desktop_image && (
                      <source
                        media="(min-width:570px)"
                        srcSet={category.desktop_image}
                      />
                    )}
                    <img
                      src={
                        category.mobile_image ||
                        category.desktop_image ||
                        "/placeholder.svg"
                      }
                      alt={category.name}
                      className="block mx-auto object-contain size-12 sm:size-20 lg:size-20 xl:size-28 aspect-square"
                    />
                  </picture>
                </Link>
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer"
                >
                  <h2 className="mt-1 md:mt-2 text-xs [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-black whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                    {category?.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        );
        
      case "10":
        return (
          <ul className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-3 lg:gap-4">
            {categories.map((category, index) => (
              <li
                key={category.id || index}
                className="cursor-pointer relative rounded-2xl overflow-hidden bg-white before:absolute before:bottom-0 before:left-0 before:w-full before:bg-white hover:before:bg-[#9cc3D5] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-none focus:shadow-none transition-all duration-200 ease-linear"
              >
                <span className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
                  <svg
                    viewBox="0 0 1440 370"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: "rotate(0deg)", transition: "0.3s" }}
                  >
                    <linearGradient
                      id={`sw-gradient-${index}`}
                      x1="0"
                      x2="0"
                      y1="1"
                      y2="0"
                    >
                      <stop stopColor="rgba(156,195,213,1)" offset="0%" />
                      <stop stopColor="rgba(255,255,255,1)" offset="100%" />
                    </linearGradient>
                    <path
                      fill={`url(#sw-gradient-${index})`}
                      d="M0,222L24,222C48,222,96,222,144,222C192,222,240,222,288,234.3C336,247,384,271,432,259C480,247,528,197,576,203.5C624,210,672,271,720,302.2C768,333,816,333,864,326.8C912,321,960,308,1008,259C1056,210,1104,123,1152,74C1200,25,1248,12,1296,37C1344,62,1392,123,1440,129.5C1488,136,1536,86,1584,98.7C1632,111,1680,185,1728,191.2C1776,197,1824,136,1872,111C1920,86,1968,99,2016,86.3C2064,74,2112,37,2160,55.5C2208,74,2256,148,2304,203.5C2352,259,2400,296,2448,271.3C2496,247,2544,160,2592,160.3C2640,160,2688,247,2736,252.8C2784,259,2832,185,2880,148C2928,111,2976,111,3024,148C3072,185,3120,259,3168,277.5C3216,296,3264,259,3312,234.3C3360,210,3408,197,3432,191.2L3456,185L3456,370L3432,370C3408,370,3360,370,3312,370C3264,370,3216,370,3168,370C3120,370,3072,370,3024,370C2976,370,2928,370,2880,370C2832,370,2784,370,2736,370C2688,370,2640,370,2592,370C2544,370,2496,370,2448,370C2400,370,2352,370,2304,370C2256,370,2208,370,2160,370C2112,370,2064,370,2016,370C1968,370,1920,370,1872,370C1824,370,1776,370,1728,370C1680,370,1632,370,1584,370C1536,370,1488,370,1440,370C1392,370,1344,370,1296,370C1248,370,1200,370,1152,370C1104,370,1056,370,1008,370C960,370,912,370,864,370C816,370,768,370,720,370C672,370,624,370,576,370C528,370,480,370,432,370C384,370,336,370,288,370C240,370,192,370,144,370C96,370,48,370,24,370L0,370Z"
                    />
                  </svg>
                </span>
                <Link
                  href={handleNavigate(category?.current_url)}
                  className="block cursor-pointer relative z-10"
                >
                  <picture className="py-5">
                    {category.desktop_image && (
                      <source
                        media="(min-width:570px)"
                        srcSet={category.desktop_image}
                      />
                    )}
                    <img
                      src={
                        category.mobile_image ||
                        category.desktop_image ||
                        "/placeholder.svg"
                      }
                      alt={category.name}
                      className="block mx-auto object-contain size-12 sm:size-20 lg:size-20 xl:size-28 aspect-square"
                    />
                  </picture>
                </Link>
                <h2 className="p-2 md:p-3 text-xs relative z-10 [@media(max-width:360px)]:text-[10px] sm:text-xs 2xl:text-base text-center font-semibold text-black whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                  {category?.name}
                </h2>
              </li>
            ))}
          </ul>
        );
        
      default:
        return null;
    }
  }, [isMounted, categories, staticdata?.home_page_layout_style]);

  return (
    <section className="relative grow">
      <div className="rz-app-wrap sm:rounded-xl mx-auto flex flex-col gap-4 xl:flex-nowrap">
        {/* ✅ FIX: Show loading state until mounted and data ready */}
        <OptimizedLoader 
          isLoading={!isMounted || pageLoder || !categories || categories.length === 0} 
          fallback={<CategorySkeletonGrid count={24} layout={staticdata?.home_page_layout_style || "1"} />}
        >
          {Categorylayout}
        </OptimizedLoader>
        
        {isMounted && staticdata?.desktop_description && (
          <div
            dangerouslySetInnerHTML={{ __html: staticdata.desktop_description }}
            className="font-normal break-words break-all text-xs sm:text-xs text-[#686868] mt-2.5"
          />
        )}
        
        {isMounted && metadata?.title && (
          <div className="text-xl xl:text-2xl font-semibold text-zinc-900 mb-4 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 shadow-lg text-center p-4 py-3">
            <h1 className="text-base font-semibold text-center md:text-lg xl:text-xl 2xl:text-2xl">
              {metadata.title}
            </h1>
          </div>
        )}
      </div>
    </section>
  );
}