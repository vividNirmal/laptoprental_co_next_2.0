"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Edit, Loader2 } from "lucide-react";
import { CustomPagination } from "@/components/common/pagination";
import Link from "next/link";
import { getRequest } from "@/service/viewService";

export default function BannerThemePage() {
  const [themes, setThemes] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Banner position mapping for visual display with images
  const getBannerPosition = (slug) => {
    const positions = {
      'category_listing': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-3 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-2 bg-blue-500 mt-1 mx-auto rounded"></div>
            <div className="text-xs text-center text-gray-600 mt-1">Category</div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Category Page</span>
        </div>
      ),
      'listing_side_bar': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative flex">
            <div className="w-4 h-full bg-blue-500 rounded-l-md"></div>
            <div className="flex-1 bg-gray-200 rounded-r-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Sidebar</span>
        </div>
      ),
      'footer_bottom': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-8 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-2 bg-blue-500 rounded-b-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Footer Bottom</span>
        </div>
      ),
      'blog_paragraphs': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-3 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-2 bg-blue-500 my-1"></div>
            <div className="w-full h-3 bg-gray-200 rounded-b-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Blog Content</span>
        </div>
      ),
      'after_blog_image': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-4 bg-green-200 rounded-t-md"></div>
            <div className="w-full h-2 bg-blue-500"></div>
            <div className="w-full h-4 bg-gray-200 rounded-b-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">After Image</span>
        </div>
      ),
      'chat_boat': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-8 bg-gray-200"></div>
            <div className="w-full h-2 bg-blue-500 rounded-b-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Chat Area</span>
        </div>
      ),
      'header_bottom': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative">
            <div className="w-full h-3 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-2 bg-blue-500"></div>
            <div className="w-full h-5 bg-gray-100 rounded-b-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Header Bottom</span>
        </div>
      ),
      'left_side_banner': (
        <div className="flex flex-col items-center w-20">
          <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 relative flex">
            <div className="w-4 h-full bg-blue-500 rounded-l-md"></div>
            <div className="flex-1 bg-gray-200 rounded-r-md"></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Left Banner</span>
        </div>
      )
    };
    return positions[slug] || (
      <div className="flex flex-col items-center w-20">
        <div className="w-16 h-12 border-2 border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
          <span className="text-xs text-gray-500">?</span>
        </div>
        <span className="text-xs text-gray-600 mt-1">{slug}</span>
      </div>
    );
  };

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-banner-theme-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setThemes(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch banner themes:", error);
      setThemes([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [searchTerm, pageSize, currentPage]);
  const totalPages = Math.ceil(totalEntries / pageSize);
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handlePageSizeChange = (value) => {
    const newSize = Number(value);
    if (newSize !== pageSize) {
      setPageSize(newSize);
      setCurrentPage(1);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-muted-foreground">Total Entries : {totalEntries}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* No Add new/Delete buttons visible in the image for this page */}
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table>
            <TableHeader>
              <TableRow>
                {/* No checkbox column visible in the image for this page */}
                <TableHead>Slug</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : themes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No banner themes found.
                  </TableCell>
                </TableRow>
              ) : (
                themes.map((theme) => (
                  <TableRow key={theme._id}>
                    <TableCell className="font-medium">{theme.banner_theme_slug}</TableCell>
                    <TableCell>
                      {getBannerPosition(theme.banner_theme_slug)}
                    </TableCell>
                    <TableCell>{theme.banner_theme_size}</TableCell>
                    <TableCell>{theme.provide_name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          theme.status ? "bg-green-400 text-green-900" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {theme.status ? "Active" : "Deactive"}
                      </span>
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/banner-theme/edit-banner-theme/${theme._id}`}>
                        <Button>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">entries</span>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
}
