"use client";
import {
  handlesetCategoryDetails,
  handleSetListingType,
} from "@/redux/listinDynamicrouter/Listing";
import { userGetRequest } from "@/service/viewService";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Listing from "./listing";
import ListingDetails from "./listingDetails";
import ProductListing from "./productListing";
import ProductDetails from "./productDetails";
import JobListing from "./jobListing";
import JobDetails from "./jobDetails";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import JsonLdScript from "@/components/JsonLdScript";
import { useParams } from "next/navigation";
import { getMetaDetails } from "@/lib/getMetaDetails";
import { handleSearchValue } from "@/redux/settingReducer/settinReducer";

export default function MainRoute({ slug, id, slugData }) {
  const [pageLoader, setPageLoader] = useState(true);
  const [type, setType] = useState("");
  const [data, setData] = useState(null);
  const [headerpass, setHeaderpass] = useState(null);
  const [structuredSchemas, setStructuredSchemas] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [urlslug, setUrlslug] = useState('')
  const params = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    setPageLoader(true);
    fetchDataWithId();
    if (slug) {
      const header = slug
        .trim()
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setHeaderpass(header);
    }
    fetchmetaData();
  }, []);

  async function fetchmetaData() {
    const currentUrl = window.location.href;
    let dynamicSlug;
    if (id) {
      dynamicSlug = `${slug}/${id}`;
      setUrlslug(`${slug}/${id}`)
    } else {
      dynamicSlug = slug;
    }
    const meta = await getMetaDetails("slug", dynamicSlug, currentUrl);
    setMetadata(meta.data);
  }

  function generateStructuredData(type, data) {
    const schemas = [];

    switch (type) {
      case "job_details":
        const job = data?.job_detail;
        if (!job) return;
        schemas.push({
          id: "job-details-schema",
          data: {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job?.job_title || "No Job Title",
            description: job?.description || "No Description Available",
            identifier: {
              "@type": "PropertyValue",
              name: "Tech Company Ltd.",
              value: "SNJS20250430",
            },
            datePosted: job?.createdAt || new Date().toISOString(),
            validThrough: "2025-05-30T23:59",
            employmentType: "FULL_TIME",
            hiringOrganization: {
              "@type": "Organization",
              name: "Tech Company Ltd.",
              sameAs: "https://www.techcompany.com",
              logo: "https://www.techcompany.com/logo.png",
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                streetAddress: "No Address available",
                addressLocality: job?.address || "",
                addressRegion: "",
                postalCode: "",
                addressCountry: "",
              },
            },
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: {
                "@type": "QuantitativeValue",
                value: 1500000,
                unitText: "YEAR",
              },
            },
            applicantLocationRequirements: {
              "@type": "Country",
              name: "India",
            },
            remote: true,
          },
        });
        break;

      case "product_listing":
        const products = data?.products?.data || [];
        schemas.push({
          id: "product-listing-schema",
          data: {
            "@context": "https://schema.org/",
            "@type": "ItemList",
            itemListElement: products.map((p, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: p.product_name || "Unnamed Product",
                image: p.product_images || [],
                description:
                  p.product_description?.replace(/<[^>]+>/g, "") || "",
                brand: {
                  "@type": "Brand",
                  name: p.product_category_id?.name || "",
                },
                offers: {
                  "@type": "Offer",
                  url: `${window?.location?.href} || ""}`,
                  priceCurrency: "INR",
                  price: p.product_price || "0",
                  availability: p.status
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              },
            })),
          },
        });
        break;

      case "category_location":
        const category = data?.category_details || {};
        const locations = data?.listing_data?.listings || [];

        const seen = new Set();
        const uniqueLocations = locations.filter((loc) => {
          const key = `${loc.name}-${loc.website}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const itemListElement = uniqueLocations.map((loc, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": ["LocalBusiness", "Organization"],
            name: loc.name || "Unnamed Location",
            image: loc.image_url ? [loc.image_url] : [],
            address: {
              "@type": "PostalAddress",
              streetAddress: loc.address || "",
              addressLocality: loc.area_id?.name || "",
              addressRegion: loc.state_id || "",
              postalCode: loc.pincode || "",
              addressCountry: "IN",
            },
            geo:
              loc.latitude && loc.longitude
                ? {
                    "@type": "GeoCoordinates",
                    latitude: parseFloat(loc.latitude),
                    longitude: parseFloat(loc.longitude),
                  }
                : undefined,
            telephone: loc.phone_number || "",
            email: loc.email || "",
            url: loc.website?.startsWith("http")
              ? loc.website
              : `https://${loc.website}`,
            priceRange:
              loc.price && loc.time_duration
                ? `₹${loc.price} Per ${loc.time_duration}`
                : undefined,
          },
        }));

        schemas.push({
          id: "category-location-schema",
          data: {
            "@context": "https://schema.org/",
            "@type": "ItemList",
            itemListElement,
          },
        });

        // Add review schema
        const ratingValue = category.ratingvalue || 0;
        const ratingCount = category.ratingcount || 0;
        if (ratingValue > 0 && ratingCount > 0) {
          schemas.push({
            id: "category-review-schema",
            data: {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: category.name || "Category Name",
              url: window.location.href,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: ratingValue.toFixed(1),
                reviewCount: ratingCount,
                bestRating: 5,
                worstRating: 1,
              },
              review: [
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "Users" },
                  reviewBody: `This category has a rating of ${ratingValue.toFixed(
                    1
                  )}`,
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: ratingValue,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  datePublished: new Date().toISOString(),
                },
              ],
            },
          });
        }
        break;

      case "job_listing":
        const jobListings = data?.job_list?.data || [];

        const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "").trim();

        schemas.push({
          id: "job-listing-schema",
          data: {
            "@context": "https://schema.org/",
            "@type": "ItemList",
            itemListElement: jobListings.map((job, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              item: {
                "@type": "JobPosting",
                title: job.job_title || "No title provided",
                description: stripHtml(job.description),
                datePosted: job.createdAt || new Date().toISOString(),
                validThrough: new Date(
                  new Date(job.createdAt || Date.now()).getTime() +
                    30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                employmentType: "FULL_TIME",
                hiringOrganization: {
                  "@type": "Organization",
                  name: job.job_category_id?.[0]?.name || "Unknown Org",
                },
                jobLocation: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: job.address || "",
                    addressLocality: job.address?.split(",")[0]?.trim() || "",
                    addressRegion: job.address?.split(",")[1]?.trim() || "",
                    addressCountry: "IN",
                  },
                },
                baseSalary: job.salary
                  ? {
                      "@type": "MonetaryAmount",
                      currency: "INR",
                      value: {
                        "@type": "QuantitativeValue",
                        value: Number((job.salary.match(/\d+/) || ["0"])[0]),
                        unitText: "MONTH",
                      },
                    }
                  : undefined,
                applicantLocationRequirements: {
                  "@type": "Country",
                  name: "India",
                },
                url: job.url,
              },
            })),
          },
        });
        break;

      case "product_details":
        const product = data?.product_details;
        const listing = data?.listing_details;
        const location = data?.current_location;

        if (!product) return;

        const hasValidRatingProduct =
          Number(product.ratingvalue) > 0 && Number(product.ratingcount) > 0;

        const productImages = product.product_images?.map((img) =>
          img.startsWith("http")
            ? img
            : `https://api.${window.location.hostname}/${img}`
        );

        const brandName =
          listing?.category_ids?.find(
            (cat) => cat.unique_id === product.product_category_id
          )?.name || "Rental Category";

        const structuredProductData = {
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.product_name?.trim() || "Rental Product",
          image: productImages.length > 0 ? productImages : [],
          description:
            product.product_description
              ?.replace(/<[^>]+>/g, "")
              .replace(/&nbsp;/g, " ")
              .trim() || "",
          sku: product.product_listing_id || "",
          brand: {
            "@type": "Brand",
            name: brandName,
          },
          offers: {
            "@type": "Offer",
            url: window.location.href,
            priceCurrency: "INR",
            price:
              product.product_price === "N/A"
                ? 0
                : Number(product.product_price) || 0,
            availability:
              product.status === true
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: listing?.name || window.location.hostname,
              url: listing?.website || window.location.origin,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: listing?.phone_number || "",
                contactType: "Customer Service",
                name: listing?.contact_person || "",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  listing?.address || location?.area_name || "Unknown Area",
                addressLocality: location?.area_name || "",
                addressRegion: listing?.state_id?.name || "",
                postalCode: listing?.pincode || "",
                addressCountry: listing?.country_id?.name || "India",
              },
            },
          },
          ...(hasValidRatingProduct && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.ratingvalue,
              reviewCount: product.ratingcount,
            },
            review: {
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: product.ratingvalue,
                bestRating: 5,
                worstRating: 1,
              },
              author: {
                "@type": "Person",
                name: "Customer",
              },
            },
          }),
        };

        schemas.push({
          id: "product-details-schema",
          data: structuredProductData,
        });

        break;

      default:
        break;
    }

    setStructuredSchemas(schemas);
  }

  async function fetchDataWithId() {
    const limit = 20;
    try {
      const url = `get-listing-details-data?limit=${limit}&url_slug=${slug}${
        id ? `/${id}` : ""
      }`;
      const res = await userGetRequest(url);
      if (res) {
        setData(res.data);
        generateStructuredData(res.data?.type, res.data);
        setPageLoader(false);
        const locationdata = res.data?.current_location;                
        setType(res.data?.type);
        dispatch(handleSetListingType(res.data?.type));
        dispatch(handlesetCategoryDetails(res.data?.category_details));
        if (!locationdata) return;
        sessionStorage.setItem("location_data", JSON.stringify(locationdata));
        dispatch(handleSearchValue(locationdata));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <div className="flex flex-col w-full">
      {pageLoader && (
        <div className="l">
          <div className="container mx-auto w-full">
            <div className="flex gap-4 md:gap-5 flex-wrap lg:flex-nowrap">
              <div className="w-full lg:w-3/4">
                <ul className="grid gap-2 md:gap-3 lg:gap-4 max-[360px]:gap-1 w-full">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 rounded-xl" />
                  ))}
                </ul>
              </div>
              <div className="w-full lg:w-1/4">
                <ul className="grid gap-2 md:gap-3 lg:gap-4 max-[360px]:gap-1 w-full">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-72 rounded-xl" />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {!data && (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Image
            src="/assets/data-not-found.svg"
            alt="No data found"
            width={300}
            height={200}
            className="mx-auto"
          />
          <h3 className="mt-4 text-2xl md:text-3xl font-medium text-gray-800">
            Data Not Found
          </h3>
        </div>
      )}
      <div className="l">
        <div className="container mx-auto w-full">
          {type == "category_location" && <Listing data={data} urlslug ={urlslug}/>}
          {type == "listing_details" && <ListingDetails data={slugData} />}
          {type == "product_listing" && <ProductListing data={data} />}
          {type == "product_details" && <ProductDetails data={slugData} />}
          {type == "job_listing" && <JobListing data={data} />}
          {type == "job_details" && <JobDetails data={slugData} />}
        </div>
      </div>
      {type !== "listing_details" && type !== "product_details" && (
            <div className="mt-4 text-xl xl:text-2xl font-semibold text-zinc-900 mb-4 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 shadow-lg text-center p-4 py-3">
              <h1 className="text-base font-semibold text-center md:text-lg xl:text-xl 2xl:text-2xl">
                {metadata?.meta_title ? metadata?.meta_title : headerpass}
              </h1>
            </div>
          )}
      {structuredSchemas.map((schema) => (
        <JsonLdScript key={schema.id} id={schema.id} data={schema.data} />
      ))}
    </div>
  );
}
