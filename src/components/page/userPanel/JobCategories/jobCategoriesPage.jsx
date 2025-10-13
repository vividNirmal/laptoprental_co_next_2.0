"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { userGetRequest } from "@/service/viewService";
import { Button } from "@/components/ui/button";
import JsonLdScript from "@/components/JsonLdScript";
import FallbackImage from "@/components/FallbackImage";

export default function JobCategoriesPage() {
  const router = useRouter();
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobSchema, setJobSchema] = useState(null);

  const getCurrentLocation = () => {
    let location = JSON.parse(sessionStorage.getItem("location_data"));
    return location;
  };

  useEffect(() => {
    const currentLocation = getCurrentLocation();
    if (currentLocation) {
      fetchCategories(currentLocation?.current_location_id);
    }
  }, []);

  const fetchCategories = async (locationId) => {
    try {
      setLoading(true);
      const res = await userGetRequest(
        `get-job-category?location_id=${locationId}`
      );
      const json = await res;
      setJobList(json?.data?.data || []);
      generateStructuredData(json?.data?.data);
    } catch (err) {
      console.error("Failed to fetch job categories", err);
    } finally {
      setLoading(false);
    }
  };

  const generateStructuredData = (jobs) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: jobs.map((job, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: job.name,
        url: job.url,
        image: job.image,
      })),
    };

    setJobSchema(schema);
  };

  const navigateTo = (url) => {
    try {
      const path = new URL(url).pathname;
      router.push(path);
    } catch (error) {
      console.error('Invalid URL:', url);
    }
  };

  return (
    <div className="min-h-svh">
      <div className="container mx-auto w-full">
        <div className="pb-3">
          <h2 className="text-base md:text-lg xl:text-xl 2xl:text-2xl font-semibold text-zinc-700">Job Categories</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 [&>div]:!h-[188px] [&>div]:md:!h-[236px] [&>div]:!rounded-xl [&>div]:!bg-[#e2e2e2] [&>div]:border [&>div]:border-white">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton key={idx} height={236} />
            ))}
          </div>
        ) : jobList.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
            {jobList.map((item) => (
              <li key={item.name} className="flex flex-col p-3 md:px-4 md:py-5 relative bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-[0px_6px_12px_rgba(30,10,58,0.04)] hover:shadow-[0px_14px_40px_rgba(30,10,58,0.1)] transition-all duration-300 ease-in-out">
                <FallbackImage
                  src={item?.image}
                  alt={item?.name || "Job Category Image"}
                  width={96}
                  height={96}
                  className="size-24 lg:size-28 block mx-auto"
                  loading="eager"
                />
                <h3 className="grow mt-1 md:mt-2 mb-3 text-xs sm:text-xs lg:text-base text-center font-semibold text-[#313F48] capitalize">
                  {item?.name}
                </h3>
                <Button onClick={() => navigateTo(item.url)} className="bg-white rounded-4xl px-5 py-1.5 text-xs mx-auto border border-gray-300 text-gray-600 hover:bg-[#007bff] hover:border-[#007bff] hover:text-white transition-all duration-200 ease-linear">View Jobs</Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-zinc-800">No Job Categories found.</div>
        )}
      </div>

      {/* Inject Job Category Structured Data */}
      {jobSchema && <JsonLdScript id="job-categories-schema" data={jobSchema} />}
    </div>
  );
}
