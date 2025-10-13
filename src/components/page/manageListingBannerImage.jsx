"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  X,
} from "lucide-react";
import { getRequest } from "@/service/viewService";
import { CustomPagination } from "../common/pagination";
import { DeleteConfirmationDialog } from "../common/deleteDialog";
import moment from "moment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { postRequest } from "@/service/viewService";
import { toast } from "sonner";

export default function ManageListingBannerImagePage() {
  const [otps, setOtps] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOtp, setSelectedOtp] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [viewStatusPopupOpen, setViewStatusPopupOpen] = useState(false);
  const [editPop, setEditPopup] = useState(false);
  const [editId, setEditId] = useState("");

  const [desktopImage, setDesktopImage] = useState(null);
  const [desktopImageUrl, setDesktopImageUrl] = useState(null);

  const [mobileImage, setMobileImage] = useState(null);
  const [mobileImageUrl, setMobileImageUrl] = useState(null);

  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const handleCloseEditPopup = () => {
    setEditPopup(false);
    setDesktopImage(null);
    setDesktopImageUrl(null);
    setMobileImage(null);
    setMobileImageUrl(null);

    if (desktopInputRef.current) desktopInputRef.current.value = "";
    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  const handleEditPopUpOpen = (id) => {
    setEditPopup(true);
    setEditId(id);
  };

  const handleDesktopImageChange = (e) => {
    const file = e.target.files[0];
    setDesktopImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDesktopImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    setMobileImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMobileImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateData = async () => {
    if (!desktopImage) {
      toast.error("Please select desktop image");
      return;
    }
    if (!mobileImage) {
      toast.error("Please select mobile image");
      return;
    }

    const formData = new FormData();
    formData.append("cover_image", desktopImage);
    formData.append("mobile_cover_image", mobileImage);
    formData.append("listing_id", editId);
    try {
      const res = await postRequest("update-listing-banners", formData);
      //toast.success(res.message);
      fetchOtps();
      handleCloseEditPopup();
    } catch (err) {
      if (err?.response?.data?.errors?.length) {
        //toast.error(err.response.data.errors[0].message);
      } else {
        //toast.error(err?.response?.data?.message || 'Something went wrong.');
      }
    }
  };
  const fetchOtps = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `listing-banners?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      //   const response = await fetchService.request('GET',
      //     `get-all-pending-otp?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      //   );
      setOtps(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch listing banner images:", error);
      setOtps([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOtps();
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

  const generateProductUrl = (item) => {
    const productSlug = item.product_name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `/pro-${productSlug}-${item.unique_id}`;
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOtp(new Set(otps.map((user) => user._id)));
    } else {
      setSelectedOtp(new Set());
    }
  };

  const handleSelectProduct = (userId) => {
    const newSelected = new Set(selectedOtp);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedOtp(newSelected);
  };
  const handleBulkDelete = () => {
    if (selectedUsers.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedUsers) });
    }
  };
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("users_ids[]", deleteDialog.users);
      const result = await userModuleservice.deleteUser(formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedUsers(new Set());
        fetchUsers(1, selectedLimit, searchTerm);
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };
  const srNumber = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };
  const dateFormat = (data) => {
    return moment(data).format("DD-MM-YYYY");
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
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="text-left">
            <TableHeader>
              <TableRow>
                <TableHead>Last Name</TableHead>
                <TableHead>Desktop Cover Image</TableHead>
                <TableHead>Mobile Cover Image</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : otps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No Records found.
                  </TableCell>
                </TableRow>
              ) : (
                otps.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.listing_name}</TableCell>
                    <TableCell>
                      <img
                        src={item.cover_image}
                        alt="Desktop_cover_image"
                        className="w-20 h-14 object-cover rounded-md inline-block"
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={item.mobile_cover_image}
                        alt="Mobile_cover_image"
                        className="w-12 h-18 object-cover rounded-md inline-block"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleEditPopUpOpen(item.listing_id)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
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
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries}{" "}
          entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="10">10</SelectItem> */}
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
        onClose={() => setDeleteDialog({ open: false, users: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.users.length > 1 ? "Delete Users" : "Delete User"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} users? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        loading={loading}
      />
      {editPop && (
        <AlertDialog open={editPop} onOpenChange={() => handleCloseEditPopup()}>
          <AlertDialogContent className="sm:max-w-2xl">
            <button
              onClick={() => handleCloseEditPopup()}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Listing Banner Images</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <form action="" className="block max-w-full">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex flex-wrap relative w-full md:w-[45%] md:grow">
                    <label
                      htmlFor="desktop_cover"
                      className="text-xs md:text-base mb-1 w-full"
                    >
                      Desktop Cover Image
                    </label>
                    <input
                      ref={desktopInputRef}
                      className="grow block w-full py-2.5 px-3 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      id="desktop_cover"
                      type="file"
                      onChange={handleDesktopImageChange}
                    />
                    {desktopImageUrl && (
                      <img
                        src={desktopImageUrl}
                        alt="Desktop Cover"
                        className="w-full h-[200px] object-cover mt-2 rounded"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap relative w-full md:w-[45%] md:grow">
                    <label
                      htmlFor="mobile_cover"
                      className="text-xs md:text-base mb-1 w-full"
                    >
                      Mobile Cover Image
                    </label>
                    <input
                      ref={mobileInputRef}
                      className="grow block w-full py-2.5 px-3 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      id="mobile_cover"
                      type="file"
                      onChange={handleMobileImageChange}
                    />
                    {mobileImageUrl && (
                      <img
                        src={mobileImageUrl}
                        alt="Mobile Cover"
                        className="w-full h-[250px] object-cover mt-2 rounded"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] md:text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block max-w-96">
                      Please upload your images in .webp format for faster
                      loading
                    </span>
                  </div>
                </div>
              </form>
            </div>
            <AlertDialogFooter>

              <Button
                variant="secondary"
                onClick={() => handleCloseEditPopup()}
              >
                Close
              </Button>
              <AlertDialogAction onClick={handleUpdateData}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
