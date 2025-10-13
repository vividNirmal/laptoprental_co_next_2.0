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
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Search,
  Edit,
  Eye,
  ChevronRight,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  fileDownloadRequest,
  getRequest,
  postRequest,
} from "@/service/viewService";
import { ProductImportModal } from "@/components/common/importDialog";
import ExportButton from "@/components/common/exportbutton";
import { CustomPagination } from "@/components/common/pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { StatusConfirmationDialog } from "@/components/common/statuschangeDialog";
import moment from "moment";

export default function ListingReviewPage() {
  const [reviewslist, setReviewsList] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    reviews: [],
  });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    review: null,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewAdminPopupOpen, setViewAdminPopupOpen] = useState({
    open: false,
    review: null,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-listing-reviewList?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setReviewsList(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviewsList([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageSize, currentPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReviews(new Set(reviewslist.map((review) => review._id)));
    } else {
      setSelectedReviews(new Set());
    }
  };

  const handleSelectReview = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedReviews.size > 0) {
      setDeleteDialog({ open: true, reviews: Array.from(selectedReviews) });
    }
  };

  const handleDelete = (reviewId) => {
    setDeleteDialog({ open: true, reviews: [reviewId] });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      deleteDialog.reviews.forEach((id) => formData.append("review_ids[]", id));
      const result = await postRequest("delete-listing-reviewlist", formData);
      if (result.status === 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedReviews(new Set());
        fetchReviews(); // Re-fetch reviews after deletion
        setDeleteDialog({ open: false, reviews: [] });
      }
    } catch (error) {
      toast.error("Error", {
        description: `${error.message || "Failed to delete reviews."}`,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fileDownloadRequest(
        "GET",
        "get-review-import-excel-formet?type=2"
      );
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Listing Reviews.csv";
      a.click();
      URL.revokeObjectURL(url);
      setExportLoading(false);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setExportLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    setStatusLoading(true);
    try {
      const formdata = new FormData();
      formdata.append("review_id", statusDialog.review);
      formdata.append("type", "2");
      const result = await postRequest(`approve-reviews`, formdata);
      if (result.status === 1) {
        fetchReviews();
        setStatusDialog({ open: false, review: null });
      } else {
        toast.error("Status update failed", {
          description: result.message || "",
        });
      }
    } catch (error) {
      toast.error("Status update failed", {
        description: error?.message || "",
      });
    } finally {
      setStatusLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">
          Total Entries : {totalEntries}
        </div>
        <div className="relative w-full max-w-3xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/dashboard/listing-review/add-review-lising">
          <Button>
            <Plus className="size-4" />
            Add new
          </Button>
        </Link>
        <Button onClick={handleExport}>
          <UploadCloud className="size-4" />
          {exportLoading ? <Loader2 /> : "Download Review Format"}
        </Button>
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Upload className="size-4" />
          Import
        </Button>
        {selectedReviews.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedReviews.size})
          </Button>
        )}
      </div>
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="w-full align-middle">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[4%]">
                  <Checkbox
                    checked={
                      selectedReviews.size === reviewslist.length &&
                      reviewslist.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Listing Name</TableHead>
                <TableHead>Review By</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : reviewslist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <span>Record Not Found</span>
                  </TableCell>
                </TableRow>
              ) : (
                reviewslist.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedReviews.has(review._id)}
                        onCheckedChange={() => handleSelectReview(review._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {review?.listing_id?.name}
                    </TableCell>
                    <TableCell>{review?.user_id?.name}</TableCell>
                    <TableCell>{review.rating}</TableCell>
                    <TableCell className="flex items-center justify-start gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2 bg-transparent"
                        onClick={() => {
                          setViewAdminPopupOpen({ open: true, review: review });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>

                      {review.isApproved != true && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 bg-transparent"
                          onClick={() =>
                            setStatusDialog({ open: true, review: review._id })
                          }
                        >
                          Approve
                        </Button>
                      )}
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
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries}{" "}
          entries
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
        onClose={() => setDeleteDialog({ open: false, reviews: [] })}
        onConfirm={confirmDelete}
        title={
          deleteDialog.reviews.length > 1 ? "Delete Reviews" : "Delete Reviews"
        }
        description={
          deleteDialog.reviews.length > 1
            ? `Are you sure you want to delete ${deleteDialog.reviews.length} Review? This action cannot be undone.`
            : "Are you sure you want to delete this Review? This action cannot be undone."
        }
        loading={loading}
      />
      <StatusConfirmationDialog
        isOpen={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, company: null })}
        onConfirm={confirmStatusChange}
        user={statusDialog.company}
        loading={statusLoading}
      />

      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Listing Review Import"
        apiEndpoint="/import-listing-reviews"
        refetch={fetchReviews}
      />

      {viewAdminPopupOpen.open && (
        <AlertDialog
          open={viewAdminPopupOpen.open}
          onOpenChange={() => setViewAdminPopupOpen({ open: false, review: null })}
        >
          <AlertDialogContent className="sm:max-w-2xl">
            <button
              onClick={() => setViewAdminPopupOpen({ open: false, review: null })}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Listing Review Details</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <table className="w-full border-collapse">
                <tbody>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Listing Name
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {viewAdminPopupOpen.review?.listing_id.name}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Email
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {viewAdminPopupOpen.review?.user_id.email || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Rating
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {viewAdminPopupOpen.review?.rating || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Comment
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {viewAdminPopupOpen.review?.comment || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Approved
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {viewAdminPopupOpen.review?.isApproved ? "Yes" : "No"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Date
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {moment(viewAdminPopupOpen.review.createdAt).format(
                        "DD/MM/YYYY"
                      )}
                    </td>
                  </TableRow>
                </tbody>
              </table>
            </div>
            <AlertDialogFooter>
              <Button
                variant="secondary"
                onClick={() =>setViewAdminPopupOpen({ open: false, review: null })}
              >
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
