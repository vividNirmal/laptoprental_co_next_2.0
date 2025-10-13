"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const SitemapJobCategory = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSitemaps = async () => {
    setLoading(true);
    try {
      const res = await apiGet(
        "/generated-sitemap-urls?module_name=job_category&type=null"
      );
      if (res.status === 1) {
        setUrls(res.data.urls || []);
      }
    } catch (e) {
      setUrls([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSitemaps();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/generate-job-category-sitemap");
      if (res.status === 1) {
        // fetchSitemaps();
        setUrls(res.data || []);
        toast.success(res.message);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to generate sitemap.');
      setUrls([]);
    }
    setLoading(false);
  };

  return (
    <div >
      
      <div className="sticky top-0 z-10 bg-white pb-4">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Generating..." : "Generate Sitemap"}
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {" "}
          <div className="max-h-[70vh] overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {urls.map((url, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border rounded-md text-xs break-all"
                >
                 <Link href={url} target="_blank" rel="noopener noreferrer" className="break-words text-xs 2xl:text-base text-gray-600 hover:underline hover:text-[#7367f0] hover:bg-[#7367f0]/5 rounded transition-colors">
                    {url}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SitemapJobCategory
