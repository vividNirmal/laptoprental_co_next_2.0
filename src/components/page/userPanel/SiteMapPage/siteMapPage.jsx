"use client";
import { userGetRequest } from "@/service/viewService";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function SiteMapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [siteMap, setSiteMap] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);
  const limit = 10;

  const fetchSiteMap = async (page = 1) => {
    setLoading(true);
    try {
      const response = await userGetRequest(
        `sitemap-urls?page=${page}&limit=${limit}`
      );

      if (response.status === 1) {
        setSiteMap(response.data);
        setCurrentPage(response.data.currentPage);
        generatePageNumbers(
          response.data.currentPage,
          response.data.totalPages
        );
      } else {
        setSiteMap(null);
      }
    } catch (error) {
      console.error("Failed to fetch sitemap:", error);
      setSiteMap(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePageNumbers = (current, total) => {
    const pages = [];
    const maxVisible = 7;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = Math.min(total, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    setPageNumbers(pages);
  };

  const navigateToLink = (url) => {
    try {
      const path = new URL(url).pathname;
      const relativePath = path.startsWith("/") ? path.slice(1) : path;
      router.push(relativePath);
    } catch (error) {
      console.error("Invalid URL:", url);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      fetchSiteMap(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (siteMap && currentPage < siteMap.totalPages) {
      fetchSiteMap(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (typeof page === "number" && page !== currentPage) {
      fetchSiteMap(page);
    }
  };

  useEffect(() => {
    fetchSiteMap();
  }, []);

  return (
    <section
      className="relative grow"
    >
      <div className="rz-app-wrap sm:rounded-xl container mx-auto flex flex-wrap items-start justify-center gap-4 pb-14 pt-1 xl:flex-nowrap xl:px-6 2xl:px-9">
        <div className="mx-auto w-full px-2.5">
          {/* Loading state */}
          {loading ? (
            <div className="pt-12 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-4 gap-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="pb-3">
                <h1 className="text-base md:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-500">
                  Sitemap
                </h1>
              </div>

              {/* Links List */}
              {siteMap?.entries?.length > 0 ? (
                <ul className="text-[#0056b3] lg:columns-2 xl:columns-3">
                  {siteMap.entries.map((link, index) => (
                    <li key={index} className="py-2 border-b border-gray-400">
                      <a
                        className="cursor-pointer hover:underline"
                        onClick={() => navigateToLink(link.url)}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500">No links found.</div>
              )}

              {/* Pagination Controls */}
              {siteMap?.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center space-x-3 mt-10 overflow-x-auto px-2">
                  <button
                    onClick={previousPage}
                    disabled={currentPage === 1}
                    className="btn-sitemap shrink-0 flex items-center justify-center px-3 py-2 border border-[#424C55] rounded-full text-base font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <ul className="flex flex-wrap justify-center gap-2 px-2">
                    {pageNumbers.map((page, index) => (
                      <li
                        key={index}
                        onClick={() => handlePageClick(page)}
                        className={`flex items-center justify-center px-4 py-2 border border-[#424C55] rounded-full text-base font-semibold cursor-pointer whitespace-nowrap ${
                          currentPage === page
                            ? "bg-yellow-300"
                            : "text-[#323F48] hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={nextPage}
                    disabled={!siteMap || currentPage === siteMap.totalPages}
                    className="btn-sitemap shrink-0 flex items-center justify-center px-3 py-2 border border-[#424C55] rounded-full text-base font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
