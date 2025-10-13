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
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Search,
  Edit,
  Eye,
  Loader2,
  UploadCloud,
  Trash2Icon,
} from "lucide-react";
import { fileDownloadRequest, getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import ExportButton from "@/components/common/exportbutton";
import { toast } from "sonner";

function MangageReditect() {
  const [rediract, setRediract] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRediract, setSelectedRediract] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [deleteallDialog, setDeleteAllDialog] = useState({ open: false });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-redirects-url?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );

      setRediract(response.data.data || []);
      setTotalEntries(response.data.totalCountry || 0);
    } catch (error) {
      console.error("Failed to fetch rediract:", error);
      setRediract([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
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
      setSelectedRediract(new Set(rediract.map((user) => user._id)));
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
  const handleBulkDelete = () => {
    if (selectedRediract.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedRediract) });
    }
  };
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "1");
      formData.append("url_ids[]", deleteDialog.users);
      const result = await postRequest("delete-redirects-url", formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedRediract(new Set());
        fetchProducts(1, pageSize, searchTerm);
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
        fetchProducts(1, pageSize, searchTerm);
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fileDownloadRequest("GET", "get-url-excel-formet");
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Redirect URl.csv";
      a.click();
      URL.revokeObjectURL(url);
      setExportLoading(false);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setExportLoading(false);
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/manage-redirects/add-redirects">
            <Button><Plus className="size-4" /> Add new</Button>
          </Link>
          <Button onClick={handleExport}>
            <UploadCloud className="size-4" />
            {exportLoading ? <Loader2 /> : "Format"}
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="size-4" />
            Import
          </Button>
          <ExportButton endpoint="get-redircet-url-export" fileName="Redirect URl.csv" />
          <Button variant="destructive" onClick={() => setDeleteAllDialog(true)}>
            <Trash2Icon className="size-4" />
            Empty
          </Button>

          {selectedRediract.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="size-4" />
              Delete Selected ({selectedRediract.size})
            </Button>
          )}
        </div>
      </div>
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedRediract.size === rediract.length && rediract.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>From URL</TableHead>
                <TableHead>To URL</TableHead>
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
              ) : rediract.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No rediract found.
                  </TableCell>
                </TableRow>
              ) : (
                rediract.map((rediract) => (
                  <TableRow key={rediract._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRediract.has(rediract._id)}
                        onCheckedChange={() => handleSelectProduct(rediract._id)}
                      />
                    </TableCell>
                    <TableCell className="text-zinc-700">
                      <Link href={rediract?.from_url} target="_blank">
                        {rediract?.from_url}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-700">
                      <Link href={rediract?.to_url} target="_blank">
                        {rediract?.to_url}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm">
                          <Link href={`/dashboard/manage-redirects/add-redirects/${rediract._id}`}>
                            <Edit className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(rediract._id)}>
                          <Trash2 className="size-4" />
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
          <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
      {/* delete all  */}
      <DeleteConfirmationDialog
        isOpen={deleteallDialog.open}
        onClose={() => setDeleteAllDialog({ open: false })}
        onConfirm={confirmDeleteAll}
        title={"Delete URL"}
        description={`Are you sure you want to delete All Url? This action cannot be undone.`}
        loading={loading}
      />
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Rediract Import"
        apiEndpoint="/redircet-url-import"
        refetch={fetchProducts}
      />
    </>
  );
}

export default MangageReditect;
