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
import { Plus, Trash2, Search, Edit, Loader2 } from "lucide-react";
import {  getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import { toast } from "sonner";

export default function StaticpageListing() {
  const [listing, setListing] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [loading, setLoading] = useState(true);
  const [selectedRediract, setSelectedRediract] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-static-page-list?page=${currentPage}&limit=${pageSize}`
      );

      setListing(response.data.data || []);
      setTotalEntries(response.data.totalLists || 0);
    } catch (error) {
      console.error("Failed to fetch listing:", error);
      setListing([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchList();
  }, [ pageSize, currentPage]);

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
      setSelectedRediract(new Set(listing.map((user) => user._id)));
    } else {
      setSelectedRediract(new Set());
    }
  };

  const handleSelectProduct = (userId) => {
    const newSelected = new Set(selectedRediract);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedRediract(newSelected);
  };  
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();      
      formData.append("static_ids[]", deleteDialog.users);
      const result = await postRequest("delete-static-page", formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedRediract(new Set());
        fetchList(1, pageSize);
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };
  // delete all

  const confirmDeleteAll = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "2");
      formData.append("url_ids[]", deleteDialog.users);
      const result = await postRequest("delete-redirects-url", formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedRediract(new Set());
        fetchList(1, pageSize);
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalEntries}</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/static-pages/add-static-pages">
            <Button>
              <Plus className="size-4" />
              Add new
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox checked={selectedRediract.size === listing.length && listing.length > 0} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Page name</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : listing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No listing found.
                  </TableCell>
                </TableRow>
              ) : (
                listing.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRediract.has(listing._id)}
                        onCheckedChange={() => handleSelectProduct(listing._id)}
                      />
                    </TableCell>
                    <TableCell className="text-zinc-700">{listing?.page_name}</TableCell>
                    <TableCell>
                      <div className="flex justify-start gap-2">
                        <Button size="sm">
                          <Link href={`/dashboard/static-pages/add-static-pages/${listing._id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(listing._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
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
        onClose={() => setDeleteDialog({ open: false, users: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.users.length > 1 ? "Delete URL" : "Delete URL"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} URL? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        loading={loading}
      />
    </>
  );
}
