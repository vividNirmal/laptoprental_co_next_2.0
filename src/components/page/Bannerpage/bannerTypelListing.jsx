"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Upload, Download, Trash2, Search, Edit, Eye, Loader2 } from "lucide-react";
import { CustomPagination } from "@/components/common/pagination";

import Link from "next/link";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";

// Mock service for API calls
const bannerService = {
  getBanners: async (searchTerm, page, limit) => {
    const filteredBanners = allBanners.filter((banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBanners = filteredBanners.slice(startIndex, endIndex);

    return {
      data: {
        data: paginatedBanners,
        totalEntries: filteredBanners.length,
      },
    };
  },
  deleteBanners: async (bannerIds) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { status: 1, message: "Banners deleted successfully!" };
  },
};

export default function BannerManagementPage() {
  const [banners, setBanners] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBanners, setSelectedBanners] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bannerIds: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-list-banner-type?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setBanners(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      setBanners([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBanners(new Set(banners.map((banner) => banner._id)));
    } else {
      setSelectedBanners(new Set());
    }
  };

  const handleSelectBanner = (bannerId) => {
    const newSelected = new Set(selectedBanners);
    if (newSelected.has(bannerId)) {
      newSelected.delete(bannerId);
    } else {
      newSelected.add(bannerId);
    }
    setSelectedBanners(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedBanners.size > 0) {
      setDeleteDialog({ open: true, bannerIds: Array.from(selectedBanners) });
    }
  };

  const handleDelete = (bannerId) => {
    setDeleteDialog({ open: true, bannerIds: [bannerId] });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("banner_type_ids[]", deleteDialog.bannerIds);
      const result = await postRequest("delete-banner-type", formData);
      if (result.status === 1) {
        toast.success(result.message);
        setSelectedBanners(new Set());
        fetchBanners();
        setDeleteDialog({ open: false, bannerIds: [] });
      }
    } catch (error) {
      console.error("Error deleting banners:", error);
      toast.success(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalEntries}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/dashboard/banner-types/add-banner-types">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add new
          </Button>
        </Link>
        {selectedBanners.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedBanners.size})
          </Button>
        )}
      </div>

      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedBanners.size === banners.length && banners.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Short code</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead className="text-center">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No banners found.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBanners.has(banner._id)}
                        onCheckedChange={() => handleSelectBanner(banner._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.banner_title}</TableCell>
                    <TableCell>
                      <Link
                        href={banner.banner_preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {banner.banner_preview_url}
                      </Link>
                    </TableCell>
                    <TableCell>{banner.banner_size}</TableCell>
                    <TableCell>{banner.banner_price}</TableCell>
                    <TableCell className="  text-xs font-mono">
                      {banner.banner_sortcode}
                    </TableCell>
                    <TableCell>{banner.banner_slots}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/banner-types/add-banner-types/${banner._id}`}>
                        <Button>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
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
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, bannerIds: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.bannerIds.length > 1 ? "Delete Banners" : "Delete Banner"}
        description={
          deleteDialog.bannerIds.length > 1
            ? `Are you sure you want to delete ${deleteDialog.bannerIds.length} banners? This action cannot be undone.`
            : "Are you sure you want to delete this banner? This action cannot be undone."
        }
        loading={loading}
      />
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Banner Import"
        apiEndpoint="/api/upload-banner-file" // Example API endpoint for banners
      />
    </>
  );
}
