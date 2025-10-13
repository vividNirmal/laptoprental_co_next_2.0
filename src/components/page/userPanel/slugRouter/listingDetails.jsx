"use client";
import Image from "next/image";
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  LayoutGrid,
  List,
  MessageCircleCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userPostRequestWithToken } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import JsonLdScript from "@/components/JsonLdScript";

export default function ListingDetails({ data }) {
  const staticdata = useSelector((state) => state.setting.staticData);
  const [coverImage, setCoverImage] = useState("");
  const [mobileCoverImage, setMobileCoverImage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [listingChange, setListingChange] = useState(false);  
  const reviewRef = useRef(null);
  const dispatch = useDispatch(); 
  const router = useRouter();
  const userToken = localStorage.getItem("usertoken");
  const [productSchema, setProductSchema] = useState(null);
  

  useEffect(() => {
    const destopImge = staticdata?.desktop_listing_banner;
    const mobileImge = staticdata?.mobile_listing_banner;

    if (
      data?.listing_details.cover_image.includes("uploads/default.jpg") &&
      destopImge
    ) {
      setCoverImage(destopImge);
    } else if (data?.listing_details.cover_image) {
      setCoverImage(data?.listing_details.cover_image);
    }
    if (
      data?.listing_details.mobile_cover_image.includes(
        "uploads/default.jpg"
      ) &&
      mobileImge
    ) {
      setMobileCoverImage(mobileImge);
    } else if (data?.listing_details.mobile_cover_image) {
      setMobileCoverImage(data?.listing_details.mobile_cover_image);
    }    
    
  }, [data, staticdata]);

  useEffect(() => {
    if (!data?.listing_details) return;

    const item = data.listing_details;
    const review = data.listing_review_list || {};
    const category = item.category_ids?.[0] || {};
    const description = category.description || item.product_description || "";

    const inStock = Boolean(item.status && item.approved);
    const validPrice =
      item.price === "N/A" || item.price == null ? 0 : Number(item.price);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: item.name,
      image: [item.listing_image, item.cover_image].filter(Boolean),
      description,
      sku: item.listing_unique_id,
      brand: {
        "@type": "Organization",
        name: item.contact_person || "Unknown",
      },
      category: category.name,
      offers: {
        "@type": "Offer",
        url: typeof window !== "undefined" ? window.location.href : "",
        priceCurrency: "INR",
        price: validPrice,
        priceValidUntil: new Date(item.updatedAt).toISOString(),
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Person",
          name: item.contact_person,
        },
      },
    };

    // Add review if present
    if (review.data?.length > 0) {
      schema.review = review.data.slice(0, 3).map((rev) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: rev.user_id?.name || "Anonymous",
        },
        datePublished: new Date(rev.createdAt).toISOString(),
        reviewBody: rev.comment || "",
        reviewRating: {
          "@type": "Rating",
          ratingValue: rev.rating || 0,
          bestRating: 5,
          worstRating: 1,
        },
      }));
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: item.listing_average_rating,
        reviewCount: item.listing_reviews_count,
        bestRating: 5,
        worstRating: 1,
      };
    } else {
      const avg = item.listing_avg_rating || 0;
      const count = item.listing_reviews_count || 0;
      if (avg > 0 && count > 0) {
        schema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: avg,
          reviewCount: count,
          bestRating: 5,
          worstRating: 1,
        };
      }
    }

    setProductSchema(schema);
  }, [data]);

  const handleProductDetailRedirect = (data) => {
    const productName = data?.product_name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const productSlug = `pro-${productName}-${data?.unique_id}`;

    router.push(`/${productSlug}`);
  };

  const onClickRate = (stars) => {
    setRating(stars);
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const reatingColor = (rating) => {
    switch (rating) {
      case 1:
        return "bg-red-500";
      case 2:
      case 3:
        return "bg-yellow-400";
      case 4:
      case 5:
        return "bg-green-700";
      default:
        return "bg-black";
    }
  };

  const handleListingChange = () => {
    setListingChange(!listingChange);
  };

  const formik = useFormik({
    initialValues: {
      comment: "",
    },
    validationSchema: Yup.object({
      comment: Yup.string().required("Comment is required"),
    }),
    onSubmit: async (values) => {
      
      if (!userToken) {        
        toast.error("Please login or register first");
        router.push("/login");
        return;
      }
      const formData = new FormData();
      formData.append("listing_id", data?.listing_details?._id);
      formData.append("rating", rating);
      formData.append("comment", values.comment);

      try {
        const res = await userPostRequestWithToken('add-user-listing-review',formData)
        if(res){
          formik.resetForm()
        }
        toast.success(res?.message);
        setRating(0);        
        window.location.reload()
      } catch (e) {
        console.error(e)
      }
    },
  });

  return (
    <div className="grow">
      <div className="max-w-full w-full">
        <div className="border border-solid border-gray-200 p-3 2xl:p-4 mb-5 rounded-lg 2xl:rounded-xl overflow-hidden bg-white">
          <div className="rounded-lg 2xl:rounded-xl overflow-hidden">
            <div className="flex flex-wrap gap-2 md:gap-0">
              <div className="relative w-full after:block after:pt-[160px] md:after:pt-[30%] after:w-full">
                <picture className="py-5">
                  {mobileCoverImage && (
                    <source
                      media="(min-width:570px)"
                      srcSet={mobileCoverImage}
                    />
                  )}
                  <Image
                    alt="dummy img"
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    className="block max-w-full w-full h-full rounded-lg md:rounded-none absolute left-0 top-0 object-cover"
                    src={coverImage || "/assets/default-featured-image.png"}
                    width={800}
                    height={200}
                  />
                </picture>
              </div>
            </div>
            <div className="flex flex-wrap md:px-2 2xl:px-4 pt-2 pb-4 sm:mt-0 -mt-14 relative z-[1]">
              <div className="shrink-0 size-24 rounded-lg md:rounded-xl overflow-hidden border border-solid border-gray-200 mb-4 sm:mb-0 bg-white ml-3 sm:ml-0 sm:shadow-none shadow-[0_4px_8px_0_rgba(0,0,0,25%)] p-2">
                <Image
                  alt="company logo"
                  loading="eager"
                  className="block max-w-full size-full sm:size-full object-cover rounded-md xl:rounded-lg"
                  src={data?.listing_details.listing_image || "/assets/default-featured-image.png"}
                  width={96}
                  height={96}
                />
              </div>
              <div className="w-full sm:w-2/4 grow sm:pl-3">
                <div className="flex flex-wrap md:flex-nowrap gap-1.5 md:gap-3 mb-2 md:mb-0">
                  <div className="w-full md:w-5/12 md:grow flex items-center gap-2 md:mb-1.5">
                    <h1 className="text-lg 2xl:text-xl font-medium whitespace-nowrap max-w-full text-ellipsis overflow-hidden">
                      {data?.listing_details.name}
                    </h1>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 2xl:gap-4">
                  <div className="lg:w-8/12 grow">
                    <ul className="flex flex-wrap items-center gap-1.5 md:gap-2.5 mb-1.5">
                      <li className="flex items-center gap-2 text-xs leading-none w-full md:w-fit">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 text-white font-medium">
                          <span className="font-semibold">
                            {data?.listing_details.listing_avg_rating?? "0"}
                          </span>
                          <Star className="size-4" fill="currentColor" />
                        </div>
                        <span className="font-medium text-gray-500">
                          {data?.listing_details.listing_views} Ratings
                        </span>
                      </li>
                    </ul>
                    <ul className="flex flex-wrap items-center gap-1.5 md:gap-2.5 mb-2.5">
                      <li className="relative text-xs flex items-center gap-1 group leading-none">
                        <MapPin className="size-4" />
                        <span>JB Nagar, Andheri( East ),Mumbai</span>
                        <span className="opacity-0 invisible group-hover:opacity-100 group-hover:visible block w-80 p-3 bg-white text-xs rounded-xl drop-shadow-xl absolute left-full top-2/4 -translate-y-2/4">
                          {data?.listing_details.address}
                          <div className="w-3 h-3 rotate-45 bg-white absolute top-2/4 -translate-y-2/4 -left-1.5"></div>
                        </span>
                      </li>
                      <li className="size-1 bg-gray-300 rounded-full leading-none"></li>
                      <li className="text-xs font-normal leading-none">
                        <span className="text-green-700">Open </span>
                        <span>{data?.listing_details.time_duration}</span>
                      </li>
                    </ul>
                    <ul className="flex flex-wrap items-center gap-1.5 md:gap-2.5">
                      <li className="leading-none">
                        <Button
                          className="cursor-pointer max-w-fit px-2 2xl:px-2.5 py-1 2xl:py-2 flex flex-wrap items-center justify-center gap-2 rounded-md border border-solid border-green-600 text-xs font-semibold text-white bg-green-600 hover:text-green-600 hover:bg-white transition-all duration-200 ease-in"
                          asChild
                        >
                          <Link
                            href={
                              "tel:+91" + data?.listing_details?.phone_number
                            }
                            className="animate-pulse"
                          >
                            <Phone className="size-5 animate-wobble" />
                            <span>Call Now</span>
                          </Link>
                        </Button>
                      </li>
                      <li className="leading-none">
                        <Button className="cursor-pointer max-w-fit px-2 2xl:px-2.5 py-1 2xl:py-2 flex flex-wrap items-center justify-center gap-2 rounded-md border border-solid border-[#007bff] text-xs font-semibold text-white bg-[#007bff] hover:text-[#007bff] hover:bg-white transition-all duration-200 ease-in" onClick={() => dispatch(handleQoutation(true))}>
                          <MessageCircle className="size-5" />
                          <span>Send Enquiry</span>
                        </Button>
                      </li>
                      <li className="leading-none">
                        <Button
                          className="cursor-pointer max-w-fit px-2 2xl:px-2.5 py-1 2xl:py-1.5 flex flex-wrap items-center justify-center gap-2 rounded-md border border-solid border-gray-400 text-xs font-semibold text-gray-800 bg-white hover:border-[#25d366] hover:text-white hover:bg-[#25d366] transition-all duration-200 ease-in"
                          asChild
                        >
                          <Link
                            href={
                              "https://wa.me/" +
                              data?.listing_details?.phone_number
                            }
                          >
                            <MessageCircleCode className="size-5" />
                            <span>WhatsApp</span>
                          </Link>
                        </Button>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:w-3/12 flex flex-col justify-end pt-1.5 md:pt-3 lg:pt-0">
                    <h6 className="text-xs lg:text-xs text-black font-medium lg:text-end mb-1 lg:mb-2">
                      Click to Rate
                    </h6>
                    <ul className="flex items-center gap-2 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <li key={i} className="leading-none">
                          <Button
                            type="button"
                            onClick={() => onClickRate(i + 1)}
                            className="cursor-pointer bg-white text-gray-500 hover:text-white hover:bg-[#ff6e00] rounded-lg border border-solid border-gray-200 p-1.5 2xl:p-2 flex justify-center items-center transition-all duration-200 ease-in"
                          >
                            <Star className="size-4 2xl:size-5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-5 flex-wrap lg:flex-nowrap">
          <div className="w-full lg:w-3/4">
            <Card className="w-full shadow-xl rounded-xl overflow-hidden mb-6 p-0 border-0 2xl:p-0">
              <div className="bg-[#9cc3D5] flex items-center justify-between py-2.5 lg:py-3.5 px-3.5 lg:px-5">
                <h3 className="text-base md:text-xl text-white font-semibold">
                  Products
                </h3>
                <ul className="flex items-center gap-2.5">
                  <li>
                    <Button
                      type="button"
                      onClick={handleListingChange}
                      variant={'ghost'}
                      className="size-6 bg-transparent flex items-center justify-center outline-none border-0 cursor-pointer text-[#012B72] hover:bg-transparent"
                    >
                      <LayoutGrid className="size-4 2xl:size-5" />
                    </Button>
                  </li>
                  <li>
                    <Button
                      type="button"
                      onClick={handleListingChange}
                      variant={'ghost'}
                      className="size-6 bg-transparent flex items-center justify-center outline-none border-0 cursor-pointer text-white hover:bg-transparent"
                    >
                      <List className="size-4 2xl:size-5" />
                    </Button>
                  </li>
                </ul>
              </div>
              <div
                className={`grid bg-white py-3 px-3.5 lg:px-5 gap-3 min-h-20 ${
                  listingChange ? "grid-cols-1" : "grid-cols-4"
                }`}
              >
                { data?.product_data?.error && <span>Empty</span>}
                { data?.product_data?.data?.map((item, index) => (
                  <div
                    key={index}
                    className={`${
                       data?.product_data?.totalRecords > 0 ? "" : "hidden"
                    }`}
                  >
                    <button
                      onClick={() => handleProductDetailRedirect(item)}
                      className={`cursor-pointer border border-solid border-gray-200 bg-white overflow-hidden rounded-lg shadow ${
                        listingChange ? "w-full flex" : "block w-full"
                      }`}
                    >
                      <div
                        className={`rounded-xl overflow-hidden relative after:block ${
                          listingChange
                            ? "w-1/3 after:pt-[48%]"
                            : "w-full after:pt-[56.25%]"
                        }`}
                      >
                        <img
                          src={item?.product_images[0]}
                          className="max-w-full w-full h-full block absolute top-0 left-0 object-contain"
                          alt="img"
                        />
                      </div>
                      <div
                        className={`p-2 bg-zinc-100 ${
                          listingChange ? "w-2/4 grow" : "w-full"
                        }`}
                      >
                        <h3 className="text-xs text-left font-medium text-[#012B72] mb-2 whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                          {item?.product_name}
                        </h3>
                        <p className="text-left text-xs text-black">
                          Start ₹{" "}
                          <span className="text-blue-600">
                            {item?.product_price}/-
                          </span>
                        </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            <Card
              className="w-full shadow-xl rounded-xl overflow-hidden mb-6 p-0 border-0 2xl:p-0"
              ref={reviewRef}
            >
              <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-3.5 px-3.5 lg:px-5">
                About Pconrent.com -laptop Rental-desktop, Printer Rental,
                Server Rental Services
              </h3>
              <div className="list-none bg-white py-3 p-3 lg:px-6 min-h-20">
                Empty
              </div>
            </Card>
            <Card className="w-full shadow-xl rounded-xl overflow-hidden mb-6 p-0 border-0 2xl:p-0">
              <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-4 px-3.5 lg:px-5">
                User Reviews
              </h3>
              <div className="list-none bg-white py-3 p-3 lg:px-6">
                <p className="mb-3 text-gray-700 text-xs sm:text-xs lg:text-base">
                  Writing great reviews may help others discover the places that
                  are just apt for them. Here are a few tips to write a good
                  review:
                </p>
                <ul className="flex items-center gap-2.5 mb-3">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <li
                        key={i}
                        className={`cursor-pointer transition-all 
          [&>svg]:transition-all 
          [&>svg]:duration-200 
          [&>svg]:ease-linear 
          ${
            (hoverRating || rating) > i
              ? "[&>svg]:fill-amber-400 [&>svg]:stroke-amber-400"
              : "text-gray-300"
          }`}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i + 1)}
                      >
                        <Star />
                      </li>
                    ))}
                </ul>
                <textarea
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="min-h-20 2xl:min-h-28 w-full text-xs 2xl:text-base outline-none border border-solid border-gray-300 focus:border-[#007bff] transition-all duration-200 ease-linear rounded-lg px-4 py-2"
                  placeholder="Write your review here..."
                />
                {formik.touched.comment && formik.errors.comment && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.comment}
                  </div>
                )}
                <Button
                className="px-4"
                  onClick={formik.handleSubmit}
                >
                  Submit Reviews
                </Button>
              </div>
            </Card>
            <Card className="w-full shadow-xl rounded-xl overflow-hidden mb-6 p-0 border-0 2xl:p-0">
              <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-4 px-3.5 lg:px-5">
                User Reviews
              </h3>
              <div className="rounded-md shadow p-3 md:p-6">
                <div className="flex flex-wrap justify-between">
                  <ul className="w-full md:w-5/12 grow flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((val, index) => (
                      <li key={val} className="flex items-center">
                        <span className="min-w-32 text-xs font-normal">
                          {val === 5
                            ? "Excellent"
                            : val === 4
                            ? "Good"
                            : val === 3
                            ? "Satisfactory"
                            : val === 2
                            ? "Average"
                            : "Below Average"}
                        </span>
                        <div className="bg-gray-300 h-2 rounded w-full overflow-hidden">
                          <div
                            className={`h-2 ${
                              val === 5
                                ? "bg-green-600"
                                : val === 4
                                ? "bg-blue-500"
                                : val === 3 || val === 2
                                ? "bg-yellow-400"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${
                                data?.listing_review_list?.ratingBreakdown?.[
                                  val
                                ]?.percent || 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="w-full md:w-[42%] pt-6 mt-6 md:pt-0 md:mt-0 md:pl-7 md:ml-7 text-left border-t md:border-t-0 md:border-l border-solid border-[#D9D9D9]">
                    <div className="text-lg font-semibold text-gray-700">
                      {" "}
                      Overall Ratings{" "}
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="flex items-center bg-yellow-400 text-white font-bold text-xl px-4 py-1 rounded gap-1.5">
                        {" "}
                        {data?.listing_review_list?.averageRating} <Star className="size-5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-left">
                      {" "}
                      based on {data?.listing_review_list.totalUsers} reviews{" "}
                    </div>
                  </div>
                </div>
                <hr className="my-4 text-gray-300" />
                <div>
                  <h2 className="font-semibold text-base text-gray-700">
                    Reviews
                  </h2>
                  {!data?.listing_review_list?.totalUsers && (
                    <p className="text-gray-500 mt-2 text-center text-xs mb-4">
                      Review data not found
                    </p>
                  )}

                  {data?.listing_review_list?.data?.map((item, index) => (
                    <div
                      key={index}
                      className="border border-solid border-gray-200 rounded-lg p-2 mb-3"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`rounded-md text-xs font-normal text-white p-2 py-1 w-fit shrink-0 flex items-center gap-1 ${reatingColor(
                            item?.rating
                          )}`}
                        >
                          {item?.rating}
                          <svg
                            className="size-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082..." />
                          </svg>
                        </span>
                        <h4 className="text-xs text-gray-700 w-2/4 grow">
                          {item?.user_id?.name}
                        </h4>
                      </div>
                      <p className="text-xs font-normal">{item?.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <div className="w-full lg:w-1/4">
            <div className="relative flex flex-wrap sm:flex-nowrap gap-6 lg:flex-wrap">
              <Card className="w-full shadow-xl rounded-xl overflow-hidden p-0 border-0 2xl:p-0">
                <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-3.5 px-3.5 lg:px-5">
                  Listied In
                </h3>
                <ul className="list-none bg-white py-3 px-5 text-base text-[#007bff] max-h-[200px] overflow-auto">
                  <li className="border-b border-solid border-gray-300 last:border-0 py-2">
                    <span className="cursor-pointer">Computer Rental</span>
                  </li>
                  <li className="border-b border-solid border-gray-300 last:border-0 py-2">
                    <span className="cursor-pointer">Laptop Rental</span>
                  </li>
                  <li className="border-b border-solid border-gray-300 last:border-0 py-2">
                    <span className="cursor-pointer">Rent a Laptop</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {productSchema && (
        <JsonLdScript id="product-schema" data={productSchema} />
      )}
    </div>
  );
}
