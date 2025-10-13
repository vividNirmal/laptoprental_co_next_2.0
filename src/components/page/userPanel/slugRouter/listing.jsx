"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Globe,
  Mail,
  MapPin,
  MessageCircleCode,
  Phone,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userGetRequest } from "@/service/viewService";
import { handleQoutation } from "@/redux/listinDynamicrouter/Listing";
import { useDispatch, useSelector } from "react-redux";
import FallbackImage from "@/components/FallbackImage";
import { useInView } from "@/hooks/useInView";

export default function Listing({ data, urlslug }) {
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();
  const [productList, setProductList] = useState([]);
  const [searchArray, setSearchArray] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showToggleMap, setShowToggleMap] = useState({});
  const [faq, setFaq] = useState([]);
  const [staticData, setstaticData] = useState([]);
  const detailsRef = useRef(null);
  const isDetailsVisible = useInView(detailsRef);
  // Refs to track category containers for each item
  const categoryRefs = useRef({});
  const bannerData = useSelector((state) => state.setting);
  const listingBanner =
    bannerData?.banner?.ad_listing_banners_data?.randomBanner?.banner_image;


  useEffect(() => {
    const newToggleMap = {};
    for (const [id, el] of Object.entries(categoryRefs.current)) {
      if (!el) continue;
      const style = window.getComputedStyle(el);
      const lineHeight = parseInt(style.lineHeight);
      const contentHeight = el.scrollHeight;
      newToggleMap[id] = contentHeight > lineHeight * 2;
    }
    setShowToggleMap(newToggleMap);
  }, [productList]);
  useEffect(() => {
    fetchFaq();
    if (urlslug == undefined) return;
    getListingStaticData();
  }, []);

  async function getListingStaticData() {
    try {
      const url = `get-listing-preview-data?url_slug=${urlslug}`;
      const res = await userGetRequest(url);
      if (res) {
        setstaticData(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchFaq() {
    const response = await userGetRequest("get-faq");
    if (response) {
      setFaq(response.data?.data);
    }
  }
  const shouldShowToggle = (itemId) => {
    return showToggleMap[itemId] || isExpanded(itemId);
  };

  const allData = data;

  useEffect(() => {
    const listings = data?.listing_data?.listings || [];
    setProductList(
      listings.map((item) => ({
        ...item,
        productLink: generateProductListLink(),
      }))
    );
    setLoadMorePage(data?.listing_data?.page);

    const searchKeywords = data?.category_seo_details?.search_by_keyword;
    const keywords = searchKeywords?.split(",").map((kw) => kw.trim()) || [];
    setSearchArray(
      keywords.map((name) => ({
        name,
        url: name.toLowerCase().replace(/\s+/g, "-"),
      }))
    );

    const total = data?.listing_data?.totalPages;
    const current = data?.listing_data?.page;
    setShowLoadMore(total !== current && listings.length > 19);
  }, [data]);

  const generateProductListLink = () => {
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) return path;
    return `/product-list-${parts[0]}/${parts[1]}`;
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const parts = path.split("/").filter(Boolean);
    const baseSlug = parts[0];
    const id = parts[1];
    const page = loadMorePage + 1;

    try {
      const res = await userGetRequest(
        `get-listing-details-data?page=${page}&url_slug=${baseSlug}/${id}`
      );
      const updateData =
        res?.data?.listing_data?.listings.map((item) => ({
          ...item,
          productLink: generateProductListLink(),
        })) || [];
      setProductList((prev) => [...prev, ...updateData]);
      setLoadMorePage(res?.data?.listing_data?.page);
      if (
        res?.data?.listing_data?.totalPages === res?.data?.listing_data?.page
      ) {
        setShowLoadMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to check if item is expanded
  const isExpanded = (id) => {
    return expandedItems.has(id);
  };

  // Function to toggle expand/collapse
  const toggleExpand = (id) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const navigateToListingDetails = (item) => {
    const slug = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    router.push(`/${slug}-${item?.listing_unique_id}`);
  };

  const navigateTo = (item) => {
    try {
      const path = new URL(item).pathname;

      const relativePath = path.startsWith("/") ? path.slice(1) : path;

      router.push(`${relativePath}`);
    } catch (error) {
      console.error("Invalid URL:", item);
    }
  };

  const navigateToProduct = (item) => {
    if (!path) return;

    const parts = path.split("/").filter(Boolean);

    if (parts.length < 2) return;

    const slug = parts[0];
    const id = parts[1];

    const targetPath = `/product-list-${slug}/${id}`;
    if (path !== targetPath) {
      router.push(targetPath);
    }
  };

  const categoryNavigate = (itemList, category) => {
    const findcategory = itemList?.find((item) => item?.name == category.name);
    if (!findcategory) return;

    let location = "";
    const sessionstoreg = sessionStorage.getItem("location_data");

    if (sessionstoreg) {
      try {
        const data = JSON.parse(sessionstoreg);
        const rawLocation =
          data?.location_type === "city" ? data?.city_name : data?.area_name;

        location =
          rawLocation
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-") || "";
      } catch (e) {
        console.error("Invalid session storage location_data:", e);
      }
    }
    const url = `${findcategory?.slug}-${location}/${findcategory?.unique_id}`;
    router.push(`/${url}`);
  };

  function handleRelatedcatName(name) {
    let location;
    if (data.current_location.location_type) {
      if (data.current_location?.area_name) {
        location = `${data.current_location?.area_name}, ${data.current_location?.city_name}`;
      } else {
        location = `${data.current_location?.city_name}`;
      }
    }
    return `${name} on ${location}`;
  }

  function location() {
    let location;
    if (data.current_location.location_type) {
      if (data.current_location?.area_name) {
        location = `${data.current_location?.area_name}, ${data.current_location?.city_name}`;
      } else {
        location = `${data.current_location?.city_name}`;
      }
    }
    return location;
  }

  function handleNavigate(url) {
    const path = new URL(url).pathname;
    const relativePath = path.startsWith("/") ? path.slice(1) : path;
    return relativePath;
  }
  function citynavigation(item) {
    const locationName = item?.name
      ?.toLowerCase()
      .replace(/[.,()]/g, "")
      .replace(/\s+/g, "-");
    const newURL = `/${data?.category_details?.slug}-${locationName}/${data?.category_details?.unique_id}`;
    router.push(newURL);
  }

  return (
    <div className="flex gap-4 md:gap-5 flex-wrap lg:flex-nowrap">
      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        {productList.length <= 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Image
              src="/assets/data-not-found.svg"
              alt="No data found"
              width={300}
              height={200}
              className="mx-auto"
              priority
            />
            <h3 className="mt-4 text-2xl md:text-3xl font-medium text-gray-800">
              Data Not Found
            </h3>
          </div>
        ) : (
          <>
            <ul className="list-none">
              {productList.map((item, i) => (
                <li className="mb-2.5 2xl:mb-4 last:mb-0" key={i}>
                  <Card className="relative bg-white rounded-2xl backdrop-blur-md border border-solid border-zinc-300 hover:shadow-[0_25px_50px_-12px_var(--tw-shadow-color,_#00000040)] hover:-translate-y-1 overflow-hidden group p-2.5 2xl:p-4 transition-all duration-200 ease-linear  hover:scale-[1.02]">
                    <CardContent className="p-0">
                      <div className="flex flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-1/4 md:w-1/6 relative">
                          {item.is_featured && (
                            <span className="absolute top-0 left-0 bg-blue-500 text-xl p-1 rounded-sm">
                              <StarIcon className="text-white size-4" />
                            </span>
                          )}
                          <FallbackImage
                            src={item?.image_url}
                            alt={item?.name || "Product image"}
                            width={96}
                            height={96}
                            className="h-20 2xl:h-24 w-full object-cover rounded-md"
                            priority
                          />
                        </div>

                        {/* Product Details */}
                        <div className="w-2/3 grow">
                          <h3
                            onClick={() => navigateToListingDetails(item)}
                            className="font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {item.name}
                          </h3>

                          {/* Categories with expandable functionality */}
                          <div className="mb-1 text-xs md:text-xs font-semibold text-gray-500 flex flex-wrap">
                            <div
                              ref={(el) =>
                                (categoryRefs.current[item._id] = el)
                              }
                              className={`text-xs md:text-xs font-semibold text-gray-500 flex flex-wrap ${!isExpanded(item._id) ? "line-clamp-2" : ""
                                }`}
                              style={
                                !isExpanded(item._id)
                                  ? {
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }
                                  : {}
                              }
                            >
                              {item.category_ids?.map((cat, index) => (
                                <div
                                  key={index}
                                  className="pr-1 inline-block hover:text-blue-600"
                                >
                                  <span
                                    onClick={() =>
                                      categoryNavigate(item?.category_ids, cat)
                                    }
                                    className="cursor-pointer"
                                  >
                                    {cat.name}
                                    {index < item.category_ids.length - 1 &&
                                      ","}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {shouldShowToggle(item._id) && (
                              <div
                                className="text-blue-600 text-xs cursor-pointer mt-1 inline-block"
                                onClick={() => toggleExpand(item._id)}
                              >
                                {isExpanded(item._id)
                                  ? "View Less"
                                  : "View More"}
                              </div>
                            )}
                          </div>
                          {item.address && (
                            <div className="flex items-center gap-1.5 md:gap-2 mt-2 mb-4">
                              <MapPin className="size-4 text-gray-500" />
                              <span className="text-gray-600 text-xs md:text-xs">
                                {item.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ul className="w-full md:w-[81%] xl:w-[81.5%] sm:ml-auto flex gap-1 sm:gap-2 flex-wrap">
                        <li className="grow sm:grow-0 sm:w-auto">
                          <Link
                            href={`tel:+91${item?.phone_number}`}
                            className="w-full sm:w-fit ring-offset-background focus-visible:outline-hidden focus-visible:ring-ring inline-flex items-center justify-center gap-1.5 2xl:gap-2 whitespace-nowrap text-[11px] 2xl:text-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none hover:bg-primary/90 h-8 2xl:h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-1.5 lg:px-2.5 2xl:px-4 py-2 rounded-lg font-medium transition-all duration-150 shadow-xl ease-linear hover:scale-103 active:scale-95 active:shadow-none animate-pulse"
                          >
                            <Phone className="size-3.5 2xl:size-shrink-0" />
                            Call Now
                          </Link>
                        </li>
                        <li className="grow sm:grow-0 sm:w-auto">
                          <span
                            onClick={() => dispatch(handleQoutation(true))}
                            className="w-full sm:w-fit inline-flex items-center justify-center gap-1.5 2xl:gap-2 whitespace-nowrap text-[11px] 2xl:text-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none hover:text-accent-foreground h-8 2xl:h-9 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-1.5 lg:px-2.5 2xl:px-4 py-2 rounded-lg font-medium transition-all ease-linear duration-150 bg-transparent cursor-pointer shadow-xl hover:scale-103 active:scale-95 active:shadow-none"
                          >
                            <Mail className="size-3.5 2xl:size-4hrink-0" />
                            Get Quotes
                          </span>
                        </li>
                        <li className="grow sm:grow-0 sm:w-auto">
                          <span
                            onClick={() => navigateToProduct(item)}
                            className="w-full sm:w-fit inline-flex items-center justify-center gap-1.5 2xl:gap-2 whitespace-nowrap text-[11px] 2xl:text-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none hover:text-accent-foreground h-8 2xl:h-9 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-1.5 lg:px-2.5 2xl:px-4 py-2 rounded-lg font-medium transition-all ease-linear duration-150 bg-transparent cursor-pointer shadow-xl hover:scale-103 active:scale-95 active:shadow-none"
                          >
                            <Globe className="size-3.5 2xl:size-shrink-0" />
                            Product
                          </span>
                        </li>
                        <li className="sm:grow-0 sm:w-auto">
                          <Link
                            href={`https://wa.me/${item?.phone_number}`}
                            className="w-full sm:w-fit ring-offset-background focus-visible:outline-hidden focus-visible:ring-ring inline-flex items-center justify-center gap-1.5 2xl:gap-2 whitespace-nowrap text-[11px] 2xl:text-xs focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none hover:bg-primary/90 h-8 2xl:h-9 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-2 lg:px-2.5 2xl:px-4 lg:py-2 rounded-lg font-medium shadow-xl hover:shadow-lg transition-all duration-150 ease-linear hover:scale-103 active:scale-95 active:shadow-none"
                          >
                            <MessageCircleCode className="size-5 2xl:size-4 shrink-0" />
                            <span className="hidden sm:inline-block">
                              Whatsapp
                            </span>
                          </Link>
                        </li>
                      </ul>

                      {(i + 1) % 5 === 0 &&
                        allData?.ad_listing_banners_data?.randomBanner && (
                          <div className="my-6 w-full">
                            <Image
                              src={
                                allData.ad_listing_banners_data.randomBanner
                                  .banner_image || "/placeholder.svg"
                              }
                              alt="Advertisement"
                              width={800}
                              height={200}
                              className="w-full h-auto rounded-lg shadow-md"
                              priority
                            />
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            {showLoadMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-blue-500 text-white font-medium rounded-lg transition-colors hover:bg-white hover:text-blue-500 border border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-blue-300 hover:scale-103 active:scale-95 active:shadow-none"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
            <div ref={detailsRef}>
              {isDetailsVisible && (<div className="bg-white p-5 mt-5 rounded-2xl">
                {data?.category_details?.description && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.category_details?.description,
                    }}
                    className="py-4 break-words [&>h3]:text-xl [&>h3]:mb-3 [&>h3]:font-semibold [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-4 [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs [&>p]:mb-2.5 [&>ul]:mb-3 [&>ul]:list-disc [&>ol]:pl-5 [&>ol]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>p]:sm:mb-3 [&>p]:lg:mb-4 rtz-table [&>ol]:mb-4"
                  />
                )}
                {faq.length > 0 && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-4">
                      Frequently Asked Question
                    </h5>
                    <ol className="list-decimal flex flex-col gap-4 pl-5">
                      {faq.map((item, index) => (
                        <li key={index}>
                          <h3 className="text-base font-semibold mb-1">
                            {item?.question}
                          </h3>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: item?.answer,
                            }}
                            className=" break-words [&>h3]:text-xl [&>h3]:mb-3 [&>h3]:font-semibold [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-4 [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs  [&>ul]:mb-3 [&>ul]:list-disc [&>ol]:pl-5 [&>ol]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2  rtz-table [&>ol]:mb-4"
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {staticData?.category_details?.related_categories && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1">
                      Related Categories in Mumbai
                    </h5>
                    {staticData?.category_details?.related_categories?.map(
                      (cat, index) => (
                        <div
                          key={index}
                          className="pr-1 inline-block hover:text-blue-600 text-xs"
                        >
                          <span
                            className="cursor-pointer "
                            onClick={() =>
                              categoryNavigate(
                                staticData?.category_details?.related_categories,
                                cat
                              )
                            }
                          >
                            {handleRelatedcatName(cat.name)}
                            {index <
                              staticData?.category_details?.related_categories
                                .length -
                              1 && " | "}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {/* Similar categories in Mumbai */}
                {staticData?.similer_category && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1">
                      {`Similar categories in ${location()} `}
                    </h5>
                    {staticData?.similer_category?.map((cat, index) => (
                      <div
                        key={index}
                        className="pr-1 inline-block hover:text-blue-600 text-xs"
                      >
                        <span
                          className="cursor-pointer "
                          onClick={() =>
                            categoryNavigate(staticData?.similer_category, cat)
                          }
                        >
                          {`${staticData?.category_details?.name} ${cat.name}`}
                          {index < staticData?.similer_category.length - 1 &&
                            " | "}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Laptops On Rent in Mumbai Localities */}
                {staticData?.populer_area && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1">
                      {`${staticData?.category_details?.name
                        }  in ${location()} Localities`}
                    </h5>
                    {staticData?.populer_area?.area?.map((cat, index) => (
                      <div
                        key={index}
                        className="pr-1 inline-block hover:text-blue-600 text-xs"
                      >
                        <Link
                          href={handleNavigate(cat.url)}
                          className="cursor-pointer "
                        >
                          {`${staticData?.category_details?.name} ${cat.name}`}
                          {index < staticData?.populer_area?.area.length - 1 &&
                            " | "}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                {/* Laptops On Rent in popular cities */}
                {staticData?.top_city && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1">
                      {`${staticData?.category_details?.name} in popular cities`}
                    </h5>
                    {staticData?.top_city?.map((cat, index) => (
                      <div
                        key={index}
                        className="pr-1 inline-block hover:text-blue-600 text-xs"
                      >
                        <span
                          className="cursor-pointer "
                          onClick={() =>
                            categoryNavigate(staticData?.top_city, cat)
                          }
                        >
                          {`${staticData?.category_details?.name} ${cat.name}`}
                          {index < staticData?.top_city.length - 1 && " | "}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* popular cities */}
                {staticData?.top_city && (
                  <div className="w-full pt-4 border-t border-solid border-zinc-500">
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1">
                      {`${staticData?.category_details?.name} in popular cities`}
                    </h5>
                    {staticData?.top_city?.map((cat, index) => (
                      <div
                        key={index}
                        className="pr-1 inline-block hover:text-blue-600 text-xs"
                      >
                        <span
                          className="cursor-pointer "
                          onClick={() =>
                            citynavigation(cat)
                          }
                        >
                          {cat.name}
                          {index < staticData?.top_city.length - 1 && " | "}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>)}
            </div>
          </>
        )}

        {/* Load More Button */}

      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-1/4">
        <div className="flex flex-wrap sm:flex-nowrap lg:flex-wrap gap-4 lg:sticky lg:top-4">
          {/* Search By Section */}
          <div className="w-full sm:w-1/2 lg:w-full bg-white shadow-lg rounded-xl overflow-hidden">
            <h3 className="bg-[#9cc3D5] text-white font-bold py-2 px-4">
              Search By
            </h3>
            <ul className="text-[#9cc3D5] text-xs max-h-48 overflow-y-auto">
              {searchArray.map((item, index) => (
                <li
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <a
                    href={`/${item.url}`}
                    className="block py-2 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Areas Section */}
          <div className="w-full sm:w-1/2 lg:w-full bg-white shadow-lg rounded-xl overflow-hidden">
            <h3 className="bg-[#9cc3D5] text-white font-bold py-2 px-4">
              Popular Areas
            </h3>
            <ul className="text-[#9cc3D5] text-xs max-h-60 overflow-y-auto custom-scroll">
              {data?.populer_areas?.area?.map((item, index) => (
                <li
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <button
                    type="button"
                    className="block w-full text-left py-2 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigateTo(item.url)}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>


          {listingBanner && (
            <div className="hidden xl:block shrink-0 w-full grow 2xl:grow-0 sticky top-6 rounded-xl overflow-hidden before:pt-[600px] before:block">
              <Image
                src={listingBanner || "/placeholder.svg"}
                alt="Advertisement"
                priority
                fetchPriority="high"
                fill
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
