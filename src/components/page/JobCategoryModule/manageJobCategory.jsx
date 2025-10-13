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
export default function ManageJobCategorypage() {
  const [categories, setCategories] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-job-category-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setCategories(response.data.data || []);
      setTotalEntries(response.data.totalCategories || 0);
    } catch (error) {
      console.error("Failed to fetch Job Categories:", error);
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
      const result = await postRequest('delete-job-category',formData);

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
          <Link href="/dashboard/job-category/add-job-category">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add new
            </Button>
          </Link>
          <Button
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {/* <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleExportStates}>
            <Download className="mr-2 h-4 w-4" />
            Export States
          </Button> */}
          <ExportButton endpoint="export-job-category" fileName="Job Category.csv" />
          {selectedCategory.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete({selectedCategory.size})
            </Button>
          )}
        </div>
      </div>

      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedCategory.size === categories.length && categories.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Unique Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
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
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Record Not Found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCategory.has(item._id)}
                        onCheckedChange={() => handleSelectCategory(item._id)}
                      />
                    </TableCell>
                    <TableCell>{item.unique_id}</TableCell>                      
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.slug}</TableCell>                    
                    <TableCell className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/job-category/add-job-category/${item._id}`}>
                        <Button>
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
        onClose={() => setDeleteDialog({ open: false, users: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.users.length > 1 ? "Delete Job Categories" : "Delete Job Category"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} job categories? This action cannot be undone.`
            : "Are you sure you want to delete this job category? This action cannot be undone."
        }
        loading={loading}
      />
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Job Category"
        apiEndpoint="import-job-categories"
        refetch={fetchCategories}
      />
    </>
  );
}
