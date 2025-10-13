"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Building2,
  Briefcase,
  MapPin,
  BadgeIndianRupee,
} from "lucide-react";

export default function JobListing({ data }) {  
  const router = useRouter();
  const jobs = data?.job_list?.data || [];

  const getDaysAgo = useCallback((dateStr) => {
    if (!dateStr) return "";
    const createdAt = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 Day Ago";
    return `${diffInDays} Days Ago`;
  }, []);

  const navigateTo = (url) => {
    try {
      const path = new URL(url).pathname;
      router.push(path);
    } catch (error) {
      console.error("Invalid URL:", url);
    }
  };

  return (
    <div className="w-full">
      {jobs.length > 0 ? (
        <ul className="w-full list-none flex flex-wrap gap-4 justify-between">
          {jobs.map((job) => (
            <li key={job._id} className="w-full bg-white p-4 rounded-2xl">
              <div className="flex justify-between">
                <div className="w-2/4 grow">
                  <h3 className="text-base md:text-lg font-semibold mb-0.5 cursor-pointer">
                    <a onClick={() => navigateTo(job.url)} className="hover:underline">{job.job_title}</a>
                  </h3>
                </div>
                <Image
                  src="/assets/login-img.png"
                  width={300}
                  height={200}
                  className="size-16 object-cover rounded-xl block"
                  alt="job"
                  priority />
              </div>

              <ul className="mb-4">
                <li className="flex flex-wrap md:flex-nowrap items-center gap-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={20} />
                    {job.experience}
                  </span>
                  <span className="w-px h-3.5 bg-gray-300 inline-block mx-1 md:mx-2"></span>
                  <span className="flex items-center gap-1.5">
                    <BadgeIndianRupee size={20} />
                    {job.salary}
                  </span>
                  <span className="w-px h-3.5 bg-gray-300 inline-block mx-1 md:mx-2"></span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={20} />
                    <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] md:max-w-xs">
                      {job.address}
                    </span>
                  </span>
                </li>
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-gray-400">
                  {getDaysAgo(job.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="w-full text-center py-8">
          <h3 className="text-3xl font-medium text-gray-800 text-center mt-4">
            Data Not Found
          </h3>
        </div>
      )}
    </div>
  );
}
