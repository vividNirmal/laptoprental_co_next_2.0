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
import {
  Loader2,
  Search,
  MoreVertical,
  Trash2,
  Download,
  UploadCloud,
  Upload,
  Mail,
} from "lucide-react";
import { apiGet, apiGetFile, apiPost } from "@/lib/api";
// No apiDelete needed, use apiPost for delete
import { Pagination } from "@/components/customComponents/Pagination";
import CustomModal from "@/components/customComponents/CustomModal";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import ExportButton from "@/components/common/exportbutton";
import { ProductImportModal } from "@/components/common/importDialog";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  // const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    targetId: null,
    loading: false,
  });
  const [mailLoading, setMailLoading] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const url = `/get-subscribers-list?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setSubscribers(response.data.data || []);
      setTotalSubscribers(response.data.totalLists || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setSubscribers([]);
      setTotalSubscribers(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === subscribers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(subscribers.map((s) => s._id));
    }
  };

  const handleDelete = async (ids) => {
    try {
      const formData = new FormData();
      if (Array.isArray(ids)) {
        ids.forEach((id) => formData.append("subscribe_id[]", id));
      } else {
        formData.append("subscribe_id[]", ids);
      }
      const res = await apiPost("/delete-subscribers", formData);
      if (res.status === 1) {
        toast.success(res.message);
        fetchSubscribers();
        setSelectedRows([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete subscribers");
    }
    setActionMenuOpen(null);
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      if (deleteDialog.targetId) {
        await handleDelete(deleteDialog.targetId);
      }
      setDeleteDialog({ open: false, targetId: null, loading: false });
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDownloadFormat = async () => {
    try {
      const blob = await apiGetFile("/get-subscribers-excel-formet");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers_format.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Download failed!");
    }
  };

  const handleImportSubscribers = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await apiPost("/import-subscribers", formData);
      // if (res.status === 1) {
      fetchSubscribers();
      setImportModalOpen(false);
      // toast.success(res?.message)
      setImportFile(null);
      // }
    } catch (err) {
      toast.error(err?.message);
    }
    setImportLoading(false);
  };

  const handleExportSubscribers = async () => {
    try {
      const blob = await apiGetFile("/export-subscribers");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export failed!");
    }
  };

  const handleSendMail = async () => {
    setMailLoading(true);
    try {
      const res = await apiGet("/send-mail-subscribers");
      if (res.status === 1) {
        toast.success(res.message || "Mail sent successfully!");
      } else {
        toast.error(res.message || "Failed to send mail.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send mail.");
    }
    setMailLoading(false);
  };

  return (
    <>
     
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="text-xs text-muted-foreground">Total Entries : {totalSubscribers}</div>
          <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 rounded-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadFormat}>
              <Download />
              Download format
            </Button>
            <Button onClick={() => setIsImportModalOpen(true)}>
              <Upload />
              Import Subscribers
            </Button>
            <ExportButton
              endpoint="export-subscribers"
              fileName="subscribers_export.csv"
              title="Export Subscribers"
            />
            <Button onClick={handleSendMail} disabled={mailLoading}>
              <Mail/>
              {mailLoading ? "Sending..." : "Send mail"}
            </Button>
            <Button
              onClick={() => {
                if (selectedRows.length > 0) {
                  setDeleteDialog({
                    open: true,
                    targetId: selectedRows,
                    loading: false,
                  });
                } else {
                  toast.error("Validation failed for the request.");
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete{selectedRows.length > 0 ? `(${selectedRows.length})` : ""}
            </Button>
          </div>
        </div>


      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="h-10 grow flex flex-row">
            <div className="rounded-lg border overflow-y-auto w-3xl grow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === subscribers.length &&
                          subscribers.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length > 0 ? (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(subscriber._id)}
                            onChange={() => handleSelectRow(subscriber._id)}
                          />
                        </TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>{subscriber.email || "-"}</TableCell>
                        <TableCell>
                          {subscriber.status === true
                            ? "Active"
                            : subscriber.status === false
                            ? "Deactive"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {/* <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setActionMenuOpen(
                                  actionMenuOpen === subscriber._id
                                    ? null
                                    : subscriber._id
                                )
                              }
                              className="p-1 rounded hover:bg-gray-100"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {actionMenuOpen === subscriber._id && (
                              <div className="absolute right-0 z-10 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg">
                                <button
                                  onClick={() => {
                                    setDeleteDialog({
                                      open: true,
                                      targetId: subscriber._id,
                                      loading: false,
                                    });
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </button>
                              </div>
                            )}
                          </div> */}
                          <Button
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            onClick={() => {
                              setDeleteDialog({
                                open: true,
                                targetId: subscriber._id,
                                loading: false,
                              });
                              setActionMenuOpen(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No subscribers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      {totalSubscribers > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalSubscribers)} of{" "}
            {totalSubscribers} entries
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
      {/* {importModalOpen && (
        <CustomModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title="Import Subscribers"
        >
          <form onSubmit={handleImportSubscribers}>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 py-12 cursor-pointer transition hover:border-[#7B61FF] mb-6"
              onClick={() =>
                document.getElementById("import-file-input").click()
              }
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setImportFile(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
              <span className="font-semibold text-gray-700">
                Click to upload
              </span>
              <span className="text-gray-500 text-xs mb-2">
                or drag and drop
              </span>
              <span className="text-gray-400 text-xs">
                SVG, PNG, JPG or GIF (MAX. 800×400px)
              </span>
              <input
                id="import-file-input"
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
                {importLoading ? <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </> : "Save"}
              </button>
            </div>
          </form>
        </CustomModal>
      )} */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Subscribers"
        apiEndpoint="import-subscribers"
        refetch={fetchSubscribers}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, targetId: null, loading: false })
        }
        onConfirm={confirmDelete}
        title="Delete Subscriber"
        description={
          Array.isArray(deleteDialog.targetId) &&
          deleteDialog.targetId.length > 1
            ? `Are you sure you want to delete ${deleteDialog.targetId.length} subscribers? This action cannot be undone.`
            : "Are you sure you want to delete this subscriber? This action cannot be undone."
        }
        loading={deleteDialog.loading}
      />
    </>
  );
};

export default Subscribers;
