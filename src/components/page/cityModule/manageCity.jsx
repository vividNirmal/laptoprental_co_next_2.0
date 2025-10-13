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
import {
  fileDownload,
  fileDownloadRequest,
  getRequest,
  postRequest,
} from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import { toast } from "sonner";
import ExportButton from "@/components/common/exportbutton";
export default function ManageStatepage() {
  const [states, setStates] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportLoader, setExportLoader] = useState(false);
  const [statusPopFlag, setStatusPopFlag] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-admin-city-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setStates(response.data.data || []);
      setTotalEntries(response.data.totalCountry || 0);
    } catch (error) {
      console.error("Failed to fetch states:", error);
      setStates([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStates();
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
      setSelectedState(new Set(states.map((user) => user._id)));
    } else {
      setSelectedState(new Set());
    }
  };

  const handleSelectProduct = (userId) => {
    const newSelected = new Set(selectedState);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedState(newSelected);
  };
  const handleBulkDelete = () => {
    if (selectedState.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedState) });
    }
  };
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      deleteDialog.users.forEach((id) => formData.append("city_ids[]", id));
      const result = await postRequest("delete-city", formData);

      if (result.status == 1) {
        toast.success(result.message);
        fetchStates();
        setDeleteDialog({ open: false, users: [] });
        setSelectedState(new Set());
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };

  const handleStatusPopup = (item) => {
    setStatusPopFlag(true);
    setCurrentItem(item);
  };

  const handleStatusPopupClose = () => {
    setStatusPopFlag(false);
    setCurrentItem(null);
  };
  const handleStatusChange = async () => {
    if (!currentItem) return;

    try {
      const res = await getRequest(`city-action/${currentItem._id}`);
      toast.success(res?.message);
      fetchStates(); // Re-fetch list to reflect status change
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setStatusPopFlag(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalEntries}</div>
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
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/manage-city/add-city">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add new
            </Button>
          </Link>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import City
          </Button>
          {/* <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleExportStates}>
                <Download className="mr-2 h-4 w-4" />
                Export States
              </Button> */}
          <ExportButton endpoint="export-city" fileName="cities.csv" />
          {selectedState.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete({selectedState.size})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedState.size === states.length && states.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Unique Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Top City</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : states.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Record Not Found.
                </TableCell>
              </TableRow>
            ) : (
              states.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedState.has(item._id)}
                      onCheckedChange={() => handleSelectProduct(item._id)}
                    />
                  </TableCell>
                  <TableCell>{item.unique_id ? item.unique_id : '-'}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.state_id?.name}</TableCell>
                  <TableCell>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id={item._id}
                        type="checkbox"
                        checked={item.is_top_city}
                        onChange={() => handleStatusPopup(item)}
                        className="sr-only peer"
                      />
                      <div
                        onClick={() => handleStatusPopup(item)}
                        className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7367f0]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                      ></div>
                    </label>
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2">
                    <Link href={`/dashboard/manage-city/add-city/${item._id}`}>
                      <Button size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item._id)}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        title={deleteDialog.users.length > 1 ? "Delete Cities" : "Delete City"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} Cities? This action cannot be undone.`
            : "Are you sure you want to delete this City? This action cannot be undone."
        }
        loading={loading}
      />
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import City"
        apiEndpoint="import-city" // Example API endpoint
        refetch={fetchStates}
      />
      {statusPopFlag && (
        <AlertDialog
          open={statusPopFlag}
          onOpenChange={() => handleStatusPopupClose()}
        >
          <AlertDialogContent className="sm:max-w-2xl">
            <button
              onClick={() => handleStatusPopupClose()}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Top City</AlertDialogTitle>
            </AlertDialogHeader>
            Are you sure you want to make a top city?
            <AlertDialogFooter>
              <Button
                variant="secondary"
                onClick={() => handleStatusPopupClose()}
              >
                Close
              </Button>
              <Button variant="destructive" onClick={handleStatusChange}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
