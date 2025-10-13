"use client";
import Loader1 from "@/components/common/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { userGetRequest } from "@/service/viewService";
import { useEffect, useState } from "react";

export default function TermsPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAboutUs = async () => {
    try {
      setLoading(true);
      const response = await userGetRequest(
        "get-static-page?page_name=Terms and Conditions"
      );
      setAbout(response.data || null);
    } catch (err) {
      console.error("Failed to fetch about us:", err);
      setAbout(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  return (
    <section className="relative grow pt-4">
      <div className="rz-app-wrap sm:rounded-xl container mx-auto flex flex-wrap items-start justify-center gap-4 pb-10 pt-1 xl:flex-nowrap xl:px-6 2xl:px-9">
        <div className="mx-auto w-full px-2.5">
          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col gap-3">
             {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-5 rounded-xl" />
              ))}
           </div>
          ) : about && about?.page_content ? (
            <div className="pb-3">
              <h2 className="text-xl font-semibold text-black md:text-lg xl:text-xl 2xl:text-2xl mb-4">
                {about?.page_name}
              </h2>
              <div
                className={`break-words [&>h3]:text-xl [&>h3]:mb-3 [&>h3]:font-semibold
                [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black 
                [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-2 [&>h3>strong]:font-semibold
                [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs [&>p]:mb-2.5 
                [&>ul]:mb-3.5 [&>ul]:list-disc [&>ul]:pl-6 [&>ol>li]:text-xs [&>ul>li]:mb-2 
                [&>p]:sm:mb-3 [&>p]:lg:mb-4 [&>ol+h3]:mt-5 animate-fadeIn`}
                dangerouslySetInnerHTML={{ __html: about.page_content }}
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                No content available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
