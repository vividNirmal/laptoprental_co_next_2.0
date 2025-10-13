"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Search,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  X,
  Check,
} from "lucide-react";
import { fileDownloadRequest, getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import { toast } from "sonner";
import ExportButton from "@/components/common/exportbutton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomCombobox } from "@/components/common/customcombox";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ManageListingPage() {
  const [listings, setListings] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ids: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFreshImportModalOpen, setIsFreshImportModalOpen] = useState(false);
  const [isCategoryImportModalOpen, setIsCategoryImportModalOpen] = useState(false);
  const [isUserImportModalOpen, setIsUserImportModalOpen] = useState(false);

  const [selectedListItem, setListingItem] = useState(null);
  const [approvePopup, setApprovePopup] = useState(false);

  const [dnFormatLoader, setDnFormatLoader] = useState(false);

  const [catExportPopup, setCatExportPopup] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [deleteDuplicateDialog, setDeleteDuplicateDialog] = useState({ open: false });
  const [deleteAllDialog, setDeleteAllDialog] = useState({ open: false });
  const [deleteAllLoader, setDeleteAllLoader] = useState(false);
  const [deleteDuplicateLoader, setDeleteDuplicateLoader] = useState(false);

  const fetchCategoryList = async () => {
    try {
      const res = await getRequest("get-admin-all-category-list");
      setCategoryList(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch categories");
    }
  };
  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-listing-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setListings(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0); // Assuming totalUsers is totalListings
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setListings([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and re-fetch on dependencies change
  useEffect(() => {
    fetchListings();
  }, [searchTerm, pageSize, currentPage]);
  const formik = useFormik({
    initialValues: {
      category: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      setCatExportLoader(true); // Use general loading for form submission
      try {
        // const formData = new FormData()
        // formData.append("category", values.category)
        const res = await fileDownloadRequest("GET", `category-wise-export/${values.category}`); // New endpoint for category export
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Listing.csv";
        a.click();
        URL.revokeObjectURL(url);
        setCatExportLoader(false);
        setCatExportPopup(false);
      } catch (error) {
        toast.error("Error", {
          description: error.response?.data?.message || error.message || "Category export failed.",
        });
      } finally {
        setCatExportLoader(false);
        setCatExportPopup(false);
      }
    },
  });
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
      setSelectedListings(new Set(listings.map((listing) => listing._id)));
    } else {
      setSelectedListings(new Set());
    }
  };

  const handleSelectListing = (listingId) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId);
    } else {
      newSelected.add(listingId);
    }
    setSelectedListings(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedListings.size > 0) {
      setDeleteDialog({ open: true, ids: Array.from(selectedListings) });
    }
  };

  const handleDelete = (listingId) => {
    setDeleteDialog({ open: true, ids: [listingId] });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      deleteDialog.ids.forEach((id) => formData.append("listing_ids[]", id)); // Changed to listing_ids
      const result = await postRequest("delete-listings", formData); // Changed endpoint
      if (result.status === 1) {
        toast.success(result.message);
        fetchListings();
        setDeleteDialog({ open: false, ids: [] });
        setSelectedListings(new Set());
        setLoading(false);
      } else {
        toast.error(result.message || "Deletion failed.");
      }
    } catch (error) {
      toast.error("Error", {
        description: error.response?.data?.message || error.message || "Deletion failed.",
      });
    } 
  };

  const confirmDeleteDuplicate = async () => {
    setDeleteDuplicateLoader(true);
    try {
      const res = await postRequest(`delete-duplicate-listing`, new FormData()); // FormData can be empty for POST if no data is sent
      if (res.status == 1) {
        toast.success(res.message);
        setDeleteDuplicateDialog({ open: false });
        fetchListings();
      } else {
        setDeleteDuplicateDialog({ open: false });
        toast.error(res.message || "Failed to delete duplicates");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete duplicates");
    } finally {
      setDeleteDuplicateDialog({ open: false });
      setDeleteDuplicateLoader(false);
    }
  };

  const confirmDeleteAll = async () => {
    setDeleteAllLoader(true);
    try {
      const res = await getRequest(`delete-all-listing`);
      if (res.status == 1) {
        toast.success(res.message);
        setDeleteAllDialog({ open: false });
        fetchListings();
      } else {
        setDeleteAllDialog({ open: false });
        toast.error(res.message || "Failed to delete all listings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete all listings");
    } finally {
      setDeleteAllDialog({ open: false });
      setDeleteAllLoader(false);
    }
  };

  const dataformate = (data) => {
    return moment(data).format("DD-MM-YYYY");
  };

  const generateLink = (data) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    return `/${slug}-${data?.listing_unique_id}`;
  };
  const handleUnapprove = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("listing_id", selectedListItem?._id);
      formData.append("status", selectedListItem?.approved ? "0" : "1");
      formData.append("type", "2"); // Type '2' for approved status
      const result = await postRequest("update-listing-status", formData); // New endpoint for unapprove
      if (result.status === 1) {
        handleApprovePopupClose()
        toast.success(result.message);
        fetchListings();
        setLoading(false);
      } else {
        toast.error(result.message || "Unapprove failed.");
      }
    } catch (error) {
      toast.error("Error", {
        description: error.response?.data?.message || error.message || "Unapprove failed.",
      });
    }
  };

  const handleApprovePopupOpen = (item) => {
    setApprovePopup(true);
    setListingItem(item);
  };
  const handleApprovePopupClose = () => {
    setApprovePopup(false);
    setListingItem(null);
  };

  const categoryJoin = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return "N/A";
    return categoryIds.map((item) => item.name).join(", ");
  };
  // Placeholder handlers for other buttons
  const handleDNFormat = async () => {
    setDnFormatLoader(true);
    try {
      const res = await fileDownloadRequest("GET", "get-import-excel-formet");
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Listing.csv";
      a.click();
      URL.revokeObjectURL(url);
      setDnFormatLoader(false);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setDnFormatLoader(false);
    }
  };
  const handleCatExportPopupOpen = () => {
    setCatExportPopup(true);
  };
  const handleCatExportPopupClose = () => {
    setCatExportPopup(false);
  };

  const handleImportListing = () => setIsImportModalOpen(true); // Reusing existing modal
  const handleCategoryWiseImport = () => setIsCategoryImportModalOpen(true);
  const handleFreshImport = () => setIsFreshImportModalOpen(true);
  const handleUserWiseImport = () => setIsUserImportModalOpen(true);
  const handleDeleteDuplicateEntry = () => setDeleteDuplicateDialog({ open: true });
  const handleDeleteAll = () => {
    // This will trigger the bulk delete dialog with all current listings
    setDeleteAllDialog({ open: true });
  };

  return (
    <>
      <div className="flex flex-wrap lg:flex-nowrap sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground ">Total Entries : {totalEntries}</div>
        <div className="relative w-full max-w-3xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Link href="/dashboard/manage-listing/add-listing">
          <Button>
            <Plus className="size-4" />
            Add new
          </Button>
        </Link>
        <Button onClick={handleDNFormat}>
          <Download className="size-4" />
          {dnFormatLoader ? <Loader2 /> : "DN Format"}
        </Button>
        <Button onClick={handleImportListing}>
          <Upload className="size-4" />
          Import Listing
        </Button>
        <ExportButton endpoint="export-listing" fileName="Listings.csv" />
      </div>
      <div className="flex flex-wrap lg:justify-end gap-2">
        <Button onClick={() => handleCatExportPopupOpen()}>
          <Download className="size-4" />
          Category Wise Export
        </Button>
        <Button onClick={handleCategoryWiseImport}>
          <Upload className="size-4" />
          Category Wise Import
        </Button>
        <Button onClick={handleFreshImport}>
          <Upload className="size-4" />
          Fresh Import
        </Button>
        <Button onClick={handleUserWiseImport}>
          <Upload className="size-4" />
          User Wise Import
        </Button>
        <Button onClick={handleDeleteDuplicateEntry}>
          <Trash2 className="size-4" />
          Delete duplicate entry
        </Button>
        <Button variant="destructive" onClick={handleDeleteAll}>
          <Trash2 className="size-4" />
          Delete all
        </Button>
        {selectedListings.size > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="size-4" />
            Delete ({selectedListings.size})
          </Button>
        )}
      </div>
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="text-left w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedListings.size === listings.length && listings.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Frontend view</TableHead>
                <TableHead>Listing Id</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Listing Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Is Approved</TableHead>
                <TableHead>Listing Views</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Record Not Found.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedListings.has(item._id)}
                        onCheckedChange={() => handleSelectListing(item._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={generateLink(item)} target="_blank">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="sr-only">View Frontend</span>
                      </Link>
                    </TableCell>
                    <TableCell>{item.listing_unique_id}</TableCell>
                    <TableCell>{dataformate(item.createdAt)}</TableCell>
                    {/* More robust rendering for potentially nested objects */}
                    <TableCell>
                      <p className="w-40 whitespace-nowrap text-ellipsis overflow-hidden">{item.name}</p>
                    </TableCell>
                    {/* More robust rendering for potentially nested objects */}
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger className="text-left w-32 whitespace-nowrap text-ellipsis overflow-hidden">
                          {categoryJoin(item.category_ids)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-96">
                          <p>{categoryJoin(item.category_ids)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{item.city_id[0]?.name}</TableCell>
                    <TableCell> {item.state?.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.approved ? "Yes" : "No"}</TableCell>
                    <TableCell>{item.listing_views}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/manage-listing/add-listing/${item._id}`}>
                              <Edit className="size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item._id)}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                          {!item.approved ? (
                            <DropdownMenuItem onClick={() => handleApprovePopupOpen(item)}>
                              <Check className="size-4" />
                              Approve
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleApprovePopupOpen(item)}>
                              <X className="size-4" />
                              Unapprove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.ids.length > 1 ? "Delete Listings" : "Delete Listing"}
        description={
          deleteDialog.ids.length > 1
            ? `Are you sure you want to delete ${deleteDialog.ids.length} listings? This action cannot be undone.`
            : "Are you sure you want to delete this listing? This action cannot be undone."
        }
        loading={loading}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDuplicateDialog.open}
        onClose={() => setDeleteDuplicateDialog({ open: false })}
        onConfirm={confirmDeleteDuplicate}
        title={"Delete Duplicate"}
        description={"Are you sure you want to delete duplicate? This process cannot be undone."}
        loading={deleteDuplicateLoader}
      />
      <DeleteConfirmationDialog
        isOpen={deleteAllDialog.open}
        onClose={() => setDeleteAllDialog({ open: false })}
        onConfirm={confirmDeleteAll}
        title={"Delete All"}
        description={"Are you sure you want to delete? This process cannot be undone. Delete All"}
        loading={deleteAllLoader}
      />
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Listing Import"
        apiEndpoint="import-listing"
        refetch={fetchListings}
      />
      <ProductImportModal
        isOpen={isFreshImportModalOpen}
        onClose={() => setIsFreshImportModalOpen(false)}
        title="Fresh Listing Import"
        apiEndpoint="import-fresh-listing"
        refetch={fetchListings}
      />
      <ProductImportModal
        isOpen={isUserImportModalOpen}
        onClose={() => setIsUserImportModalOpen(false)}
        title="User Listing Import"
        apiEndpoint="import-user-listing"
        refetch={fetchListings}
      />
      <ProductImportModal
        isOpen={isCategoryImportModalOpen}
        onClose={() => setIsCategoryImportModalOpen(false)}
        title="Category wise Import"
        apiEndpoint="category-wise-import"
        refetch={fetchListings}
      />
      {approvePopup && (
        <AlertDialog open={approvePopup} onOpenChange={() => handleApprovePopupClose()}>
          <AlertDialogContent className="sm:max-w-2xl">
            <button
              onClick={() => handleApprovePopupClose()}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Status</AlertDialogTitle>
            </AlertDialogHeader>
            Are you sure you want to Change Status?
            <AlertDialogFooter>
              <Button variant="secondary" onClick={() => handleApprovePopupClose()}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleUnapprove}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Category Wise Export Dialog */}
      {catExportPopup && (
        <AlertDialog open={catExportPopup} onOpenChange={handleCatExportPopupClose}>
          <AlertDialogContent className="sm:max-w-2xl">
            <button
              onClick={handleCatExportPopupClose}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Category wise Export</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-wrap gap-4 2xl:gap-5">
                <div className="w-full">
                  <div className="w-full flex-grow">
                    <Label
                      htmlFor="category"
                      className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                    >
                      Category
                    </Label>
                    <CustomCombobox
                      name="category"
                      value={formik.values.category}
                      onChange={(value) => formik.setFieldValue("category", value)}
                      onBlur={() => formik.setFieldTouched("category", true)}
                      valueKey="unique_id"
                      labelKey="name"
                      options={categoryList || []}
                      placeholder="Select Category"
                      id="category"
                    />
                    {formik.touched.category && formik.errors.category && (
                      <p className="text-xs text-red-500">{formik.errors.category}</p>
                    )}
                  </div>
                </div>
              </div>
              <AlertDialogFooter className="mt-6">
                <Button
                  variant="secondary"
                  onClick={handleCatExportPopupClose}
                  type="button"
                  disabled={loading}
                >
                  Close
                </Button>
                <Button variant="destructive" type="submit" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Confirm
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
