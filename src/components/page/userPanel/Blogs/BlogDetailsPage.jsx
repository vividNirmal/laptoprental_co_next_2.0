"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Star, CalendarDays, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { userGetRequest, userGetRequestWithToken, userPostRequestWithToken } from "@/service/viewService"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import moment from "moment"
import JsonLdScript from "@/components/JsonLdScript"
import FallbackImage from "@/components/FallbackImage"
import { useSelector } from "react-redux"
import Image from "next/image"
export default function BlogDetailsPage({ id }) {
  const [loader, setLoader] = useState(true)
  const [blog, setBlog] = useState(null)
  const [recentBlogs, setRecentBlogs] = useState([])
  const [blogsReview, setBlogsReview] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [structuredData, setStructuredData] = useState(null);
  const [showAfterImageBanner, setShowAfterImageBanner] = useState(true);
  const stars = Array(5).fill(0)
  const banners = useSelector((state) => state.setting)
  const afterImageBanner =
    banners?.banner?.ad_after_blog_image_banners_data?.randomBanner?.banner_image;
  const blogContentBanner =
    banners?.banner?.ad_blog_paragraphs_banners_data?.randomBanner?.banner_image;
  const router = useRouter()
  const reviewSectionRef = useRef(null)
  const dateFormate = (data) => {
    return moment(data).format("DD-MM-YYYY");
  };
  const getBlogDetails = useCallback(async () => {
    setLoader(true)
    try {
      const res = await userGetRequest(`frontend-blog-details/${id}`);

      setBlog(res?.data?.Blog)
      setRecentBlogs(res?.data?.recent_blogs_data)
      setBlogsReview(res?.data?.blogs_reviews)
      setStructuredData(generateArticleStructuredData(res?.data?.Blog));
    } catch (err) {
      toast.error(err.message || "Failed to load blog details.")
    } finally {
      setLoader(false)
    }
  }, [id])

  useEffect(() => {
    getBlogDetails()
  }, [id, getBlogDetails])

  const generateArticleStructuredData = (blog) => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog?.blog_title || "Untitled Blog",
      image: blog?.images?.length > 0 ? blog.images : ["https://example.com/default-image.jpg"],
      datePublished: blog?.createdAt || new Date().toISOString(),
      dateModified: blog?.updatedAt || blog?.createdAt || new Date().toISOString(),
      author: {
        "@type": "Person",
        name: blog?.author_name || "Unknown Author",
      },
      publisher: {
        "@type": "Organization",
        name: "Some Name",
        logo: {
          "@type": "ImageObject",
          url: "https://example.com/images/logo.png",
        },
      },
      description:
        blog?.content?.slice(0, 150).replace(/<[^>]*>?/gm, "") || "Blog post",
    };
  };

  const handleSubmitReview = async () => {
    const userToken = localStorage.getItem("usertoken");
    if (!userToken) {
      toast.error("Please login or register first")
      router.push("/login")
      return
    }
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    if (!reviewComment.trim()) {
      toast.error("Please provide a review comment")
      return
    }

    try {
      const formData = new FormData();
      formData.append('blog_id', id)
      formData.append('rating', rating)
      formData.append('comment', reviewComment)
      const res = await userPostRequestWithToken(`add-user-blog-review`, formData);
      if (res?.status === 1) {
        setRating(0)
        setReviewComment("")
        toast.success(res?.message || "Review submitted successfully!")
        getBlogDetails() // Refresh blog details to show new review
      } else {
        toast.error(res?.message || "Failed to submit review.")
      }
    } catch (err) {
      toast.error(err.message || "An error occurred while submitting review.")
    }
  }

  const getRatingColor = (ratingValue) => {
    switch (ratingValue) {
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-yellow-400"
      case 3:
        return "bg-yellow-400"
      case 4:
        return "bg-green-700"
      case 5:
        return "bg-green-700"
      default:
        return "bg-gray-500" // Default color if rating is unexpected
    }
  }


  return (
    <div className="w-full lg:flex flex-wrap container mx-auto px-2.5">
      {/* Blog Details */}
      {loader ? (
        <div className="lg:w-2/3 px-[15px] lg:mb-0 mb-6">
          <div className="grid grid-cols-1 gap-2 [&>div]:!h-[369px] [&>div]:lg:!h-[311px] [&>div]:!rounded-xl [&>div]:border [&>div]:border-solid [&>div]:!m-0">
            <div className="bg-gray-200 animate-pulse rounded-xl h-[369px] lg:h-[311px]"></div>
          </div>
        </div>
      ) : (
        <div className="lg:w-2/3 px-[15px] lg:mb-0 mb-6">
          <div className="lg:max-w-[750px] w-full [&>p]:text-xs md:[&>p]:text-base [&>p]:mb-3 [&>p]:text-gray-600">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4">{blog?.blog_title}</h1>
            {blog?.images ? (<FallbackImage
              src={blog.images}
              alt={"single blog image"}
              width={96}
              height={96}
              className="mb-6 max-w-full w-full h-auto md:h-96 object-cover block"
            />) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-400">
                <span>No Image</span>
              </div>
            )}
            {afterImageBanner && showAfterImageBanner && (
              <div className="my-6 relative">
                <button
                  onClick={() => setShowAfterImageBanner(false)}
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  aria-label="Close banner"
                >
                  <X className="size-4 cursor-pointer" />
                </button>
                <Image
                  src={afterImageBanner || "/placeholder.svg"}
                  width={750}
                  height={100}
                  className="max-w-full w-full h-auto object-cover rounded-xl"
                  alt="ads image"
                  fetchPriority="low"
                />
              </div>
            )}
            {blog?.content && (
              <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
                className="break-words [&>h3]:text-xl [&>h3]:mb-3 [&>h3]:font-semibold [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-4 [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs [&>p]:mb-2.5 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>p]:sm:mb-3 [&>p]:lg:mb-4"
              />
            )}
            <h2 className="text-2xl text-[#686868] text-end mt-4">- By {blog?.author_name}</h2>
          </div>
        </div>
      )}

      {/* Recent Blogs */}
      {loader ? (
        <div className="lg:px-4 lg:w-1/3 grid grid-cols-1 gap-2 [&>div]:!h-[369px] [&>div]:lg:!h-[311px] [&>div]:!rounded-xl [&>div]:border [&>div]:border-solid [&>div]:!m-0">
          <div className="bg-gray-200 animate-pulse rounded-xl h-[369px] lg:h-[311px]"></div>
        </div>
      ) : (
        <div className="lg:w-1/3 px-[15px]">
          <div className="w-full bg-white p-4 lg:max-h-[512px] rounded-xl overflow-auto">
            <h3 className="mb-4 text-2xl text-gray-600">Recent Blogs</h3>
            {recentBlogs.length === 0 ? (
              <p className="text-center text-gray-500">No recent blogs found.</p>
            ) : (
              recentBlogs.map((recBlog) => (
                <div key={recBlog._id} className="w-full flex gap-4 mb-4 last:mb-0">
                  <Link href={`/blog-details/${recBlog._id}`} className="cursor-pointer block size-25 shrink-0">
                    <FallbackImage
                      src={recBlog.images}
                      alt={"blogimg"}
                      width={96}
                      height={96}
                      className="max-w-full w-full h-full object-cover rounded-md"
                    />
                  </Link>
                  <div className="w-2/5 grow">
                    <Link
                      className="cursor-pointer block text-base font-bold mb-1 text-[#343a40] w-[90%] overflow-hidden whitespace-nowrap text-ellipsis"
                      href={`/blog-details//${recBlog._id}`}
                    >
                      {recBlog?.blog_title}
                    </Link>
                    <p className="flex gap-1 text-[#686868] text-xs">
                      <CalendarDays className="size-5" />
                      {dateFormate(recBlog?.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Reviews Section */}
      <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden mb-6 mt-4" ref={reviewSectionRef}>
        <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-4 px-3.5 lg:px-5">
          USER REVIEWS
        </h3>
        <div className="list-none bg-white py-3 p-3 lg:px-6">
          <p className="mb-3 text-gray-700 text-xs sm:text-xs lg:text-base">Writing great reviews may help others discover the places that are just apt for them. Here are a few tips to write a good review:</p>
          <ul className="flex items-center gap-2.5 mb-3">
            {stars.map((_, i) => (
              <li
                key={i}
                className="cursor-pointer transition-all [&>svg]:transition-all [&>svg]:duration-200 [&>svg]:ease-linear"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  className={cn(
                    "size-5",
                    (hoverRating || rating) > i ? "fill-amber-400 stroke-amber-400" : "text-gray-300",
                  )}
                />
              </li>
            ))}
          </ul>
          <Textarea
            className="min-h-20 2xl:min-h-28 w-full text-xs 2xl:text-base outline-none border border-solid border-gray-300 focus:border-[#007bff] mb-4 transition-all duration-200 ease-linear rounded-lg px-4 py-2"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Write your review here..."
          />
          <Button
            // className="cursor-pointer p-1.5 px-2 2xl:px-3 2xl:py-2.5 hover:bg-transparent rounded-lg w-full text-center text-xs 2xl:text-base font-semibold border border-solid border-[#FFE500] bg-[#FFE500] text-black outline-none shadow transition-all duration-200 ease-in"
            onClick={handleSubmitReview}
          >
            Submit Reviews
          </Button>
        </div>
      </div>

      {blogContentBanner && (
        <div className="w-full shadow-xl rounded-xl overflow-hidden mb-6">
          <div className="w-full h-52 overflow-hidden">
            <Image
              src={blogContentBanner || "/placeholder.svg"}
              className="block w-full h-full object-cover"
              alt="ads image"
              width={1300}
              height={128}
              fetchPriority="low"
            />
          </div>
        </div>
      )}

      {/* Blog Reviews Display */}
      <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden mb-6">
        <h3 className="bg-[#9cc3D5] text-base md:text-xl text-white font-semibold py-2.5 lg:py-4 px-3.5 lg:px-5">
          REVIEWS
        </h3>
        <div className="rounded-md shadow p-3 md:p-6">
          <div className="flex flex-wrap justify-between">
            <ul className="w-full md:w-5/12 grow flex flex-col gap-2">
              <li className="flex items-center">
                <span className="min-w-32 text-xs font-normal">Excellent</span>
                <div className="bg-gray-300 h-2 rounded w-full">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${blogsReview?.ratingBreakdown?.["5"]?.percent || 0}%` }}
                  ></div>
                </div>
              </li>
              <li className="flex items-center">
                <span className="min-w-32 text-xs font-normal">Good</span>
                <div className="bg-gray-300 h-2 rounded w-full">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${blogsReview?.ratingBreakdown?.["4"]?.percent || 0}%` }}
                  ></div>
                </div>
              </li>
              <li className="flex items-center">
                <span className="min-w-32 text-xs font-normal">Satisfactory</span>
                <div className="bg-gray-300 h-2 rounded w-full">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{ width: `${blogsReview?.ratingBreakdown?.["3"]?.percent || 0}%` }}
                  ></div>
                </div>
              </li>
              <li className="flex items-center">
                <span className="min-w-32 text-xs font-normal">Average</span>
                <div className="bg-gray-300 h-2 rounded w-full">
                  <div
                    className="bg-yellow-500 h-2 rounded"
                    style={{ width: `${blogsReview?.ratingBreakdown?.["2"]?.percent || 0}%` }}
                  ></div>
                </div>
              </li>
              <li className="flex items-center">
                <span className="min-w-32 text-xs font-normal">Below Average</span>
                <div className="bg-gray-300 h-2 rounded w-full">
                  <div
                    className="bg-red-400 h-2 rounded"
                    style={{ width: `${blogsReview?.ratingBreakdown?.["1"]?.percent || 0}%` }}
                  ></div>
                </div>
              </li>
            </ul>
            <div className="w-full md:w-[42%] pt-6 mt-6 md:pt-0 md:mt-0 md:pl-7 md:ml-7 text-left border-t md:border-t-0 md:border-l border-solid border-[#D9D9D9]">
              <div className="text-lg font-semibold text-gray-800">Overall Ratings</div>
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex items-center bg-yellow-400 text-white font-bold text-xl px-4 py-1 rounded gap-1.5">
                  {blogsReview?.averageRating?.toFixed(1) || "0.0"}
                  <Star className="fill-white size-5" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1 text-left">
                based on {blogsReview?.totalUsers || 0} reviews
              </div>
            </div>
          </div>
          <hr className="my-4 text-gray-300" />
          <div>
            <h2 className="font-semibold text-base text-gray-700">Reviews</h2>
            {!blogsReview?.totalUsers ? (
              <p className="text-gray-500 mt-2 text-center text-xs mb-4">Review data not found</p>
            ) : (
              blogsReview?.data.map((item) => (
                <div key={item._id} className="border border-solid border-gray-200 rounded-lg p-2 mb-3">
                  <div className="flex items-center gap-4 mb-3 ">
                    <span
                      className={cn(
                        "rounded-md text-xs font-normal text-white p-2 py-1 w-fit shrink-0 flex items-center gap-1",
                        getRatingColor(item?.rating),
                      )}
                    >
                      {item?.rating}
                      <Star className="fill-white size-3.5" />
                    </span>
                    <h4 className="text-xs text-gray-700 w-2/4 grow">{item?.user_id?.name}</h4>
                  </div>
                  <p className="text-xs font-normal">{item?.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {structuredData && <JsonLdScript data={structuredData} id="article-schema" />}
    </div>
  )
}
