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
import { Plus, Upload, Download, Trash2, Search, Edit, Eye, Loader2, X } from "lucide-react";
import { fileDownload, fileDownloadRequest, getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import {toast } from 'sonner';
import ExportButton from "@/components/common/exportbutton";
import moment from "moment";

export default function ManageChatbotUser() {
  const [categories, setCategories] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteAllDialog, setDeleteAllDialog] = useState({ open: false })
    const [deleteAllLoader, setDeleteAllLoader] = useState(false)
  const [dnFormatLoader, setDnFormatLoader] = useState(false);    
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-chat-boat-user-listing?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setCategories(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch Areas:", error);
      setCategories([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [searchTerm, pageSize, currentPage]);

  const totalPages = Math.ceil(totalEntries / pageSize);

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const dateFormat = (data) => {
    return moment(data).format("DD-MM-YYYY");
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
      setSelectedCategory(new Set(categories.map((user) => user._id)));
    } else {
      setSelectedCategory(new Set());
    }
  };

  const handleSelectCategory = (userId) => {
    const newSelected = new Set(selectedCategory);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedCategory(newSelected);
  };
    const handleDNFormat = async () => {
        setDnFormatLoader(true);
        try {
          const res = await fileDownloadRequest("GET", 'get-chat-boat-user-export-listing');
          const blob = new Blob([res], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = 'chatbot user.csv';
          a.click();
          URL.revokeObjectURL(url);
          setDnFormatLoader(false);
        } catch (error) {
          toast.error(error?.message);
        } finally {
          setDnFormatLoader(false);
        }
  }
  const handleDeleteAll = () => {
    // This will trigger the bulk delete dialog with all current listings
    setDeleteAllDialog({ open: true })
  }  
  const confirmDeleteAll = async () => {
    setDeleteAllLoader(true);
    try {
      const res = await postRequest(`clear-chatboat-user`);
        if(res.status == 1){
      toast.success(res.message);
        setDeleteAllDialog({ open: false});
        fetchListings();
      }else{
        setDeleteAllDialog({ open: false });
        toast.error(res.message || "Failed to delete all listings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete all listings');
    } finally {
        setDeleteAllDialog({ open: false});
      setDeleteAllLoader(false);
    }
  };  
  const handleBulkDelete = () => {
    if (selectedCategory.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedCategory) });
    }
  };
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      deleteDialog.users.forEach((id) => formData.append('category_ids[]', id));
      const result = await postRequest('delete-category',formData);

      if (result.status == 1) {
        toast.success(result.message);
        fetchCategories();
        setDeleteDialog({ open: false, users: [] });
        setSelectedCategory(new Set());
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
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
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}}
          />
        </div>
        <div className="flex flex-wrap gap-2">              
          <Button onClick={handleDNFormat}>
            <Download className="mr-2 h-4 w-4" />
            {dnFormatLoader ? <Loader2/> : 'Download CSV'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>City Name</TableHead>
                <TableHead>Phone Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Record Not Found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.category_ids[0]?.name}</TableCell>
                    <TableCell>{dateFormat(item.createdAt)}</TableCell>                    
                    <TableCell>{item.city_name}</TableCell>
                    <TableCell>{item.phone_number}</TableCell>
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
        isOpen={deleteAllDialog.open}
        onClose={() => setDeleteAllDialog({ open: false })}
        onConfirm={confirmDeleteAll}
        title={"Clear"}
        description={
          "Are you sure you want to clear All User ? This process cannot be undone."
        }
        loading={deleteAllLoader}
      />  
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Category"
        apiEndpoint="import-categories"
        refetch={fetchCategories}
      />
    </>
  );
}
