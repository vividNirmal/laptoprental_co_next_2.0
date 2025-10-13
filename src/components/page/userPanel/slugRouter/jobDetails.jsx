"use client";

import { useCallback, useState } from "react";
import { JobApplyModal } from "@/components/modal/jobApplyModal";
import {
  Star,
  Building2,
  Briefcase,
  MapPin,
  BadgeIndianRupee,
} from "lucide-react"; // or use inline SVGs
import Image from "next/image";

export default function JobDetails({ data }) {
  const job = data?.job_detail || {};

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

  return (
    <div className="flex flex-wrap gap-y-4">
      <ul className="w-full list-none flex flex-wrap gap-4 justify-between">
        <li className="w-full lg:w-5/12 grow bg-white p-4 rounded-2xl">
          <div className="flex justify-between">
            <div className="w-2/4 grow">
              <h3 className="text-base md:text-lg font-semibold mb-0.5 cursor-pointer">
                {job?.job_title}
              </h3>
              <div className="flex items-center mb-5">
                <span className="inline-block text-xs md:text-xs font-normal text-gray-800 pr-1.5">Flight Raja Travels Private Limited</span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Star size={16} className="text-[#ffab00]" />
                  4.1
                </span>
                <span className="w-px h-3.5 bg-gray-300 inline-block mx-1 md:mx-2"></span>
                <span className="text-xs text-gray-500">94 Reviews</span>
              </div>
            </div>
            <Image src="/assets/login-img.png" width={300} height={200} priority className="size-16 object-cover rounded-xl block" alt="job" />
          </div>

          <ul className="mb-4">
            <li className="flex flex-wrap md:flex-nowrap items-center gap-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Briefcase size={20} />
                {job?.experience}
              </span>
              <span className="w-px h-3.5 bg-gray-300 inline-block mx-1 md:mx-2"></span>
              <span className="flex items-center gap-1.5">
                <BadgeIndianRupee size={20} />
                {job?.salary}
              </span>
              <span className="w-px h-3.5 bg-gray-300 inline-block mx-1 md:mx-2"></span>
              <span className="flex items-center gap-1.5">
                <MapPin size={20} />
                <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis w-40">
                  {job?.address}
                </span>
              </span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-gray-400">
              {getDaysAgo(job?.createdAt)}
            </span>
          </div>

          <div className="flex justify-end border-t border-solid border-gray-200 pt-3 mt-3">
            <JobApplyModal jobId={job?._id} />
          </div>
        </li>
      </ul>

      {/* Job Description */}
      {!job?.loader && (
        <div className="w-full bg-white rounded-2xl p-4 font-normal">
          <h3 className="text-base font-semibold mb-2.5 md:mb-4">Job description</h3>

          <div className="break-words text-xs text-gray-500">
            {job?.description ? (
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            ) : (
              <div>No description found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
