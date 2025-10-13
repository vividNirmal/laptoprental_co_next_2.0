"use client";
import { userGetRequest } from "@/service/viewService";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { AddBlogModal } from "@/components/modal/addBlogModal";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JsonLdScript from "@/components/JsonLdScript";
import FallbackImage from "@/components/FallbackImage";

export default function BlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [blogList, setBlogList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [structuredData, setStructuredData] = useState(null);
  const footerdate = useSelector((state) => state.setting.footerdata);
  const categories = footerdate?.category_list || []  

  const getCurrentLocation = () => {
    let location = JSON.parse(sessionStorage.getItem("location_data"));
    return location;
  };

  const buildStructuredData = (blogs) => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: blogs.map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: blog.blog_title,
          image: blog.images,
          author: {
            "@type": "Person",
            name: blog.author_name,
          },
          datePublished: new Date(blog.createdAt).toISOString(),
          url: `https://laptoprental.co/blog/${blog.slug}`,
          description: getExcerpt(blog.content),
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://laptoprental.co/blog/${blog.slug}`,
          },
        },
      })),
    };
  };

  const getExcerpt = (html) => {
    const text = html.replace(/<[^>]+>/g, '').trim();
    return text.length > 150 ? text.substr(0, 147).trim() + '…' : text;
  };

  const fetchBlogs = async (currentLocationId, categoryId, page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await userGetRequest(
        `frontend-blog-list?current_location_id=${currentLocationId}&categorty_id=${categoryId}&search=${search}&page=${page}`
      );

      if (response.status === 1) {
        setBlogList(response.data.blogs_data);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setStructuredData(buildStructuredData(response.data.blogs_data));
      } else {
        setBlogList([]);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setBlogList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentLocation = getCurrentLocation();
    if (currentLocation && categories?.length) {
      fetchBlogs(currentLocation.current_location_id, categories[0]?._id, 1, searchTerm);
    }
  }, [categories]);

  const generatePageNumbers = () => {
    const maxVisible = 5;
    const pages = [];
    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, 1, search);
    }
  };

  const clearSearch = () => {
    if(searchTerm != ""){
    setSearchTerm("");
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, 1, "");
    }
  }
  };

  const previousPage = () => {
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentPage > 1 && currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, currentPage - 1, searchTerm);
    }
  };

  const nextPage = () => {
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentPage < totalPages && currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, currentPage + 1, searchTerm);
    }
  };

  const onPageChange = (page) => {
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, page, searchTerm);
    }
  };

  const navigateToBlog = (blogId) => {
    router.push(`/blog-details/${blogId}`);
  };

  const safeDescription = (html) => {
    return { __html: html };
  };
  const reload = () => {
    const currentLocation = getCurrentLocation();
    const categoryId = categories[0]?._id;
    if (currentLocation && categoryId) {
      fetchBlogs(currentLocation.current_location_id, categoryId, 1, searchTerm);
      }
  }

  return (
    <section className="relative grow">
      <div className="container mx-auto px-2 sm:px-4 sm:py-8">
        {/* Header with Add button and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* <AddBlogModal /> */}
          <AddBlogModal
            onSuccess={reload}
          />
          <div className="w-full md:w-1/3 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-white"
            />
            <Button
              onClick={clearSearch}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="pb-3">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-700">Blogs</h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && blogList.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-xs mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-48 w-48 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-800">No Blogs Found</h3>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && blogList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogList.map((blog) => (
              <div
                key={blog._id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToBlog(blog._id)}
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  {blog.images ? (
                    <FallbackImage
                      src={blog.images}
                      alt={blog.blog_title || "Blog Image"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-400">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {blog.blog_title}
                  </h3>
                  <div
                    className="text-gray-600 text-xs line-clamp-3"
                    dangerouslySetInnerHTML={safeDescription(blog.content)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && blogList.length > 0  && (
          <div className="flex flex-wrap items-center justify-center space-x-3 mt-10 overflow-x-auto px-2">
            {/* Previous Button */}
            <button
              onClick={previousPage}
              className="shrink-0 flex items-center justify-center px-4 py-2 border border-[#424C55] rounded-full text-base font-semibold hover:bg-gray-200 text-[#012B72]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <ul className="flex flex-wrap justify-center gap-2 px-2">
              {generatePageNumbers().map((page) => (
                <li
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`flex items-center justify-center px-4 py-2 border border-[#424C55] rounded-full text-base font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap ${
                    currentPage === page ? "bg-yellow-300" : "text-[#323F48]"
                  }`}
                >
                  {page}
                </li>
              ))}
            </ul>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="shrink-0 flex items-center justify-center px-4 py-2 border border-[#424C55] rounded-full text-base font-semibold hover:bg-gray-200 text-[#012B72]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      {structuredData && <JsonLdScript data={structuredData} id="blog-list-schema" />}
    </section>
  );
}
