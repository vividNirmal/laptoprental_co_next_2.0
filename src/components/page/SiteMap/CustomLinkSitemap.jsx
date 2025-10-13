"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const TABS = [
  { label: "Custom Sitemap One", key: "one" },
  { label: "Custom Sitemap Two", key: "two" },
  { label: "Custom Sitemap Three", key: "three" },
  { label: "Custom Sitemap Four", key: "four" },
];

const CustomLinkSitemap = () => {
  const [activeTab, setActiveTab] = useState("one");
  const [customLinks, setCustomLinks] = useState({
    one: "",
    two: "",
    three: "",
    four: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState({
    one: [],
    two: [],
    three: [],
    four: [],
  });
  const [fetchingTab, setFetchingTab] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setCustomLinks({
      ...customLinks,
      [activeTab]: e.target.value,
    });
  };

    const fetchTabLinks = async (tabKey) => {
    setFetchingTab(true);
    try {
      const res = await apiGet(`/get-custom-sitemap-urls?type=${tabKey}`);
      if (res.status === 1) {
        setCustomLinks((prev) => ({
          ...prev,
          [tabKey]: (res.data || []).join('\n'),
        }));
      } else {
        setCustomLinks((prev) => ({
          ...prev,
          [tabKey]: '',
        }));
      }
    } catch (e) {
      setCustomLinks((prev) => ({
        ...prev,
        [tabKey]: '',
      }));
    }
    setFetchingTab(false);
  };

  const handleGenerate = async () => {
    if (!customLinks[activeTab].trim()) {
      setError("Please enter at least one custom link.");
      return;
    }
    setError(""); 
    setLoading(true);
    try {
      const formData = new FormData();
      const urls = customLinks[activeTab]
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean);
      urls.forEach(url => formData.append('urls[]', url));
      formData.append('type', activeTab);
      const res = await apiPost(`/generate-custom-sitemap`, formData);
      if (res.status === 1) {
        setGeneratedUrls((prev) => ({
          ...prev,
          [activeTab]: res.data || [],
        }));
        fetchTabLinks(activeTab)
        toast.success(res.message);
      }
    } catch (e) {
      setGeneratedUrls((prev) => ({
        ...prev,
        [activeTab]: [],
      }));
      toast.error(e.message || 'Failed to generate sitemap.');
    }
    setLoading(false);
  };



  useEffect(() => {
    fetchTabLinks(activeTab);
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    fetchTabLinks(tabKey);
  };

  return (
    <div className="p-4">
      <div>
        <h1 className="mb-4 text-[20px] font-medium">Custom Link Sitemap</h1>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`
              px-2 py-2 sm:px-4 rounded-t-lg border
              flex-1 sm:flex-none
              min-w-[120px] text-center
              transition
              ${activeTab === tab.key
                ? "bg-[#7B61FF] text-white border-b-white border-[#7B61FF] -mb-px"
                : "bg-white text-[#7B61FF] border-transparent"
              }
            `}
            style={{ borderBottom: activeTab === tab.key ? "2px solid white" : "" }}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Manage Custom Link</label>
        {fetchingTab ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#7B61FF]" />
          </div>
        ) : (
          <>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={customLinks[activeTab]}
              onChange={handleInputChange}
              placeholder="Enter custom sitemap link(s)..."
            />
            {error && (
              <div className="text-red-500 text-xs mt-1">{error}</div>
            )}
          </>
        )}
      </div>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-4 bg-[#7B61FF] hover:bg-[#6a50e6]"
      >
        {loading ? "Generating..." : "Generate Sitemap"}
      </Button>
      <div className="mt-2 min-h-[40px]">
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#7B61FF]" />
          </div>
        ) : (
          generatedUrls[activeTab]?.map((url, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border rounded-md text-xs break-all mb-2"
            >
              <Link href={url} target="_blank" rel="noopener noreferrer" className="break-words text-xs 2xl:text-base text-gray-600 hover:underline hover:text-[#7367f0] hover:bg-[#7367f0]/5 rounded transition-colors">
                    {url}
                  </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomLinkSitemap;
