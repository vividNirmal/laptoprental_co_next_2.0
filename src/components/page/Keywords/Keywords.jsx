"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { apiGetFile } from "@/lib/api";
import CustomModal from "@/components/customComponents/CustomModal";
import { Pagination } from "@/components/customComponents/Pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import EditKeyWords from "./EditKeyWords";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";
import Link from "next/link";
import ExportButton from "@/components/common/exportbutton";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];

const Keywords = () => {
  const router = useRouter();
  const [keywords, setKeywords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    target: null,
    loading: false,
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false)

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const url = `/get-keywords?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setKeywords(response.data.data || []);
      setTotalKeywords(response.data.totalLists || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setKeywords([]);
      setTotalKeywords(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeywords();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleDelete = async (id) => {
    try {
      const formData = new FormData();
      formData.append("keyword_ids[]", id);
      const res = await apiPost("/delete-keywords", formData);
      if (res.status === 1) {
        toast.success(res.message);
        fetchKeywords();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete keywords");
    }
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      if (deleteDialog.target) {
        await handleDelete(deleteDialog.target._id);
      }
      setDeleteDialog({ open: false, target: null, loading: false });
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };


  const handleEdit = (keyword) => {
    const params = new URLSearchParams({
      words: keyword.words,
    });
    router.push(
      `/dashboard/manage-blacklist-keywords/${keyword._id}?${params.toString()}`
    );
  };



  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalKeywords}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
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
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="size-4" />
            Import
          </Button>
          <ExportButton endpoint="export-keywords" fileName="keywords_export.csv" title="Export Keywords" />
        </div>
      </div>

      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : keywords.length > 0 ? (
                keywords.map((keyword, idx) => (
                  <TableRow key={keyword._id || idx}>
                    <TableCell>{keyword.words}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleEdit(keyword)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              target: keyword,
                              loading: false,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No keywords found.
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </div>          
      </div>


      {totalKeywords > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalKeywords)} of{" "}
            {totalKeywords} entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show</span>
            <Select
              value={String(selectedLimit)}
              onValueChange={(value) => {
                setSelectedLimit(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
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
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, target: null, loading: false })
        }
        onConfirm={confirmDelete}
        title="Delete Keyword"
        description="Are you sure you want to delete this keyword? This action cannot be undone."
        loading={deleteDialog.loading}
      />
      {importModalOpen && (
        <CustomModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title="Import Keywords"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!importFile) return;
              setImportLoading(true);
              try {
                const formData = new FormData();
                formData.append("file", importFile);
                await apiPost("/import-keywords", formData);
                setImportModalOpen(false);
                setImportFile(null);
                fetchKeywords();
              } catch (err) {
                alert("Import failed!");
              }
              setImportLoading(false);
            }}
          >
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 py-12 cursor-pointer transition hover:border-[#7B61FF] mb-6"
              onClick={() =>
                document.getElementById("import-keywords-file-input").click()
              }
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setImportFile(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <span className="font-semibold text-gray-700">
                Click to upload
              </span>
              <span className="text-gray-500 text-xs mb-2">
                or drag and drop
              </span>
              <span className="text-gray-400 text-xs">
                XLS, XLSX (Excel) files only
              </span>
              <input
                id="import-keywords-file-input"
                type="file"
                accept=".xls,.xlsx,.csv"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files[0])}
                disabled={importLoading}
              />
              {importFile && (
                <span className="mt-4 text-xs text-green-600">
                  {importFile.name}
                </span>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-[#7B61FF] text-[#7B61FF] bg-white hover:bg-[#f5f3ff] transition"
                disabled={importLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={importLoading || !importFile}
                className="px-6 py-2 rounded-lg bg-[#7B61FF] text-white font-semibold hover:bg-[#6a50e6] transition"
              >
                {importLoading ? "Importing..." : "Import"}
              </button>
            </div>
          </form>
        </CustomModal>
      )}
      {editModalOpen && (
        <CustomModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Keyword"
        >
          <EditKeyWords
            setEditModalOpen={setEditModalOpen}
            fetchKeywords={fetchKeywords}
          />
        </CustomModal>
      )}
    </>
  );
};

export default Keywords;
