"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "../ui/skeleton";

import { Check, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { handleSearchValue } from "@/redux/settingReducer/settinReducer";
import { useInView } from "@/hooks/useInView";

export default function Footer({ userToken }) {
  const staticdata = useSelector((state) => state.setting.staticData);
  const pageLoder = useSelector((state) => state.setting.pageLoader);
  const footerdata = useSelector((state) => state.setting.footerdata);
  const listingData = useSelector((state) => state.listing);
  const bgColor = staticdata?.theme_id?.footer_background || "#9cc3D5";
  const [currentCategory, setCurrentCategory] = useState(null);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const mumbaiRef = useRef(null);
  const naviRef = useRef(null);
  const puneRef = useRef(null);

  const isMumbaiVisible = useInView(mumbaiRef);
  const isNaviVisible = useInView(naviRef);
  const isPuneVisible = useInView(puneRef);

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean); // removes empty strings
    if (
      segments.length === 2 &&
      listingData.ListingType === "category_location" &&
      listingData.categoryDetails?.slug
    ) {
      const slugFromUrl = segments[0];
      const categorySlug = listingData.categoryDetails.slug;

      if (slugFromUrl.startsWith(categorySlug)) {
        const rawName = listingData.categoryDetails.name ?? "Laptop On Rent";
        let categoryName = "";

        if (/on rent/i.test(rawName)) {
          categoryName = rawName;
        } else if (/rental/i.test(rawName)) {
          categoryName = rawName.replace(/rental/gi, "On Rent");
        } else {
          categoryName = `${rawName} On Rent`;
        }

        setCurrentCategory(`${categoryName} In`);
        return;
      }
    }

    setCurrentCategory("Laptop On Rent In");
  }, [footerdata, listingData]);

  function handelRedirect(item, cityName) {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pathname == "/") {
      router.push("/");
    } else if (listingData.ListingType === "category_location") {
      const locationName = item?.name
        ?.toLowerCase()
        .replace(/[.,()]/g, "")
        .replace(/\s+/g, "-");
      const newURL = `/${listingData.categoryDetails?.slug}-${locationName}/${listingData.categoryDetails?.unique_id}`;
      router.push(newURL);
    } else {
      router.push("/");
    }
    let locationdata = {
      area_name: item?.name || "",
      current_area_id: item?._id || "",
      current_city_id: item?.city_id,
      current_location_id: item?._id || item?.city_id,
      city_name: cityName || "",
      location_type: "area",
    };
    dispatch(handleSearchValue(locationdata));
    sessionStorage.setItem("location_data", JSON.stringify(locationdata));
  }

  function handeleListingredirate(location) {
    let newURL    
    
    if(listingData.categoryDetails?.slug){
     newURL = `/${listingData.categoryDetails?.slug}-${location}/${listingData.categoryDetails?.unique_id}`;
    }else{
      newURL = `/laptop-rental-${location}/3`
    }
    router.push(newURL);
  }

  return (
    <>
      <section
        className={`relative py-10 bg-gradient-to-r from-[#222221] to-[#38b5b5] flex flex-col before:absolute before:left-0 before:top-0 before:w-full before:h-svh before:opacity-10 before:bg-left before:bg-no-repeat before:bg-[url('/lines-bg.svg')] after:absolute after:right-0 after:bottom-0 after:w-full after:h-svh after:opacity-10 after:bg-right after:bg-no-repeat after:bg-[url('/lines-bg1.svg')]`} /* style={{ backgroundColor: bgColor }} */
      >
        <div ref={mumbaiRef} className="relative z-10 container mx-auto px-2.5">
          {pageLoder ? (
            <ul
              className={`grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4 max-[360px]:gap-1`}
            >
              {Array.from({ length: 30 }).map((_, index) => (
                <Skeleton key={index} className="h-5 rounded-xl" />
              ))}
            </ul>
          ) : (
            <ul className="w-full mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              <li className="col-span-full border-b border-solid border-white mb-4 " >
                <h2 className="text-xl xl:text-2xl font-semibold text-white text-center mb-4 cursor-pointer" onClick={()=>handeleListingredirate('mumbai')}>
                  {currentCategory} Mumbai
                </h2>
              </li>
              {isMumbaiVisible && footerdata?.mumbai_data &&
                footerdata?.mumbai_data.map((item, index) => (
                  <li
                    className="flex items-start gap-1.5 text-white cursor-pointer text-xs font-normal transition-colors duration-200"
                    key={index}
                  >
                    <MapPin className="size-4 mt-1 shrink-0" />
                    <span
                      className="text-xs md:text-xs"
                      onClick={() => handelRedirect(item, "Mumbai")}
                    >
                      {item.name}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div ref={naviRef} className="relative z-10 container mx-auto px-2.5 pt-5">
          {pageLoder ? (
            <ul
              className={`grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4 max-[360px]:gap-1 `}
            >
              {Array.from({ length: 30 }).map((_, index) => (
                <Skeleton key={index} className="h-5 rounded-xl" />
              ))}
            </ul>
          ) : (
            <ul className="w-full mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              <li className="col-span-full border-b border-solid border-white mb-4 "  >
                <h2 className="text-xl xl:text-2xl font-semibold text-white mb-4 text-center cursor-pointer " onClick={()=>handeleListingredirate('navi-mumbai')}>
                  {currentCategory} Navi Mumbai
                </h2>
              </li>
              {isNaviVisible && footerdata?.navi_mumbai &&
                footerdata?.navi_mumbai.map((item, index) => (
                  <li
                    className="flex items-start gap-1.5 text-white cursor-pointer"
                    key={index}
                  >
                    <MapPin className="size-4 mt-1 shrink-0" />
                    <span
                      className="text-xs md:text-xs"
                      onClick={() => handelRedirect(item, "Navi Mumbai")}
                    >
                      {item.name}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div ref={puneRef} className="relative z-10 container mx-auto px-2.5 pt-5">
          {/* <h2 className="text-xl xl:text-2xl font-semibold text-white mb-4 ">
            {currentCategory} Pune
          </h2> */}
          {pageLoder ? (
            <ul
              className={`grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4 max-[360px]:gap-1`}
            >
              {Array.from({ length: 30 }).map((_, index) => (
                <Skeleton key={index} className="h-5 rounded-xl" />
              ))}
            </ul>
          ) : (
            <ul className="w-full mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              <li className="col-span-full border-b border-solid border-white mb-4 " >
                <h2 className="text-xl xl:text-2xl font-semibold text-white mb-4 text-center cursor-pointer"  onClick={()=>handeleListingredirate('pune')}>
                  {currentCategory} Pune
                </h2>
              </li>
              {isPuneVisible && footerdata?.pune &&
                footerdata?.pune.map((item, index) => (
                  <li
                    className="flex items-start gap-1.5 text-white cursor-pointer"
                    key={index}
                  >
                    <MapPin className="size-4 mt-1 shrink-0" />
                    <span
                      className="text-xs md:text-xs"
                      onClick={() => handelRedirect(item, "Pune")}
                    >
                      {item.name}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
      <footer
        className="pt-6 pb-16 md:py-6 lg:py-16"
        style={{ backgroundColor: bgColor }}
      >
        <div className="container mx-auto px-3 lg:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 md:gap-y-4">
          <div>
            <Link href="/" className="block w-full">
              {(staticdata?.website_logo || staticdata?.mobile_logo) && (
                <picture>
                  {staticdata?.website_logo && (
                    <source
                      media="(min-width:570px)"
                      srcSet={`${staticdata.website_logo}?width=112&height=40`}
                    />
                  )}

                  <img
                    className="block object-contain w-full h-10 object-left"
                    src={`${
                      staticdata?.mobile_logo || staticdata?.website_logo
                    }?width=112&height=40`}
                    alt="logo"
                    width={112}
                    height={40}
                  />
                </picture>
              )}
            </Link>
            <div
              dangerouslySetInnerHTML={{
                __html: staticdata?.footer_description,
              }}
              className="font-normal break-words text-xs sm:text-xs text-[#686868] mt-2.5"
            />
          </div>

          <div>
            <h4 className="text-base sm:text-lg mb-3 md:mb-4 pt-2 font-bold text-white">
              Useful Links
            </h4>
            <ul className="text-white text-xs grid grid-cols-1 lg:grid-cols-2 gap-1.5 md:gap-2">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/job-categories">Jobs</Link>
              </li>
              <li>
                <Link href="/price-plan">Pricing Plans</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/sitemap">Sitemap</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              {!userToken && (
                <li>
                  <Link href="/login">Login</Link>
                </li>
              )}
              <li>
                <Link href="/contact-us">Help & Contact us</Link>
              </li>
              {!userToken && (
                <li>
                  <Link href="/register">Register</Link>
                </li>
              )}
              <li>
                <Link href="/terms-condition">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg mb-3 md:mb-4 pt-2 font-bold text-white">
              Contact with us
            </h3>
            <ul className="list-none flex items-center gap-3.5 md:gap-6">
              <li className="border border-[#343D46] flex items-center justify-center size-9 md:size-14 rounded-full text-white hover:bg-[#FED700] hover:border-[#FED700]">
                <Link href={staticdata?.facebook || "/"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    aria-label="facebook"
                    viewBox="0 0 30 30"
                    fill="currentColor"
                    className="size-8"
                  >
                    <path d="M15,3C8.373,3,3,8.373,3,15c0,6.016,4.432,10.984,10.206,11.852V18.18h-2.969v-3.154h2.969v-2.099c0-3.475,1.693-5,4.581-5 c1.383,0,2.115,0.103,2.461,0.149v2.753h-1.97c-1.226,0-1.654,1.163-1.654,2.473v1.724h3.593L19.73,18.18h-3.106v8.697 C22.481,26.083,27,21.075,27,15C27,8.373,21.627,3,15,3z"></path>
                  </svg>
                </Link>
              </li>
              <li className="border border-[#343D46] flex items-center justify-center size-9 md:size-14 rounded-full text-white hover:bg-[#FED700] hover:border-[#FED700]">
                <Link href={staticdata?.twitter || "/"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 50 50"
                    aria-label="twitter"
                    fill="currentColor"
                    className="size-8"
                  >
                    <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
                  </svg>
                </Link>
              </li>
              <li className="border border-[#343D46] flex items-center justify-center size-9 md:size-14 rounded-full text-white hover:bg-[#FED700] hover:border-[#FED700]">
                <Link href={staticdata?.linkedin || "/"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 30 30"
                    fill="currentColor"
                    aria-label="linkedin"
                    className="size-8"
                  >
                    <path d="M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.105,4,24,4z M10.954,22h-2.95 v-9.492h2.95V22z M9.449,11.151c-0.951,0-1.72-0.771-1.72-1.72c0-0.949,0.77-1.719,1.72-1.719c0.948,0,1.719,0.771,1.719,1.719 C11.168,10.38,10.397,11.151,9.449,11.151z M22.004,22h-2.948v-4.616c0-1.101-0.02-2.517-1.533-2.517 c-1.535,0-1.771,1.199-1.771,2.437V22h-2.948v-9.492h2.83v1.297h0.04c0.394-0.746,1.356-1.533,2.791-1.533 c2.987,0,3.539,1.966,3.539,4.522V22z"></path>
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
