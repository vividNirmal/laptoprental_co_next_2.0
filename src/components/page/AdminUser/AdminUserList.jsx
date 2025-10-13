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
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/customComponents/DeleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import CustomModal from "@/components/customComponents/CustomModal";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { ErrorMessage } from "formik";
import { ProductImportModal } from "@/components/common/importDialog";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];

const AdminUserList = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalUsers, settotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    admins: [],
    loading: false,
  });
  // const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const router = useRouter();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const url = `/admin-user-list?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setAdmins(response.data.data || []);
      settotalUsers(response.data.totalUsers || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setAdmins([]);
      settotalUsers(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleEditAdmin = (admin) => {
    router.push(`/dashboard/manage-admin-users/add-admin-user/${admin._id}`);
  };

  const handleDeleteAdmin = (admin) => {
    setDeleteDialog({ open: true, admins: [admin], loading: false });
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const url = "/admin-user-delete";
      const formData = new FormData();
      deleteDialog.admins.forEach((admin) => {
        formData.append("user_ids[]", admin._id);
      });
      const res = await apiPost(url, formData);
      if (res.status === 1) {
        setDeleteDialog({ open: false, admins: [], loading: false });
        fetchAdmins();
        toast.success(res.message);
      }
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      console.error("Error deleting admin user(s):", error);
    }
  };

  const handleAddAdminUser = () => {
    // router.push("/dashboard/manage-admin-users/add-admin-user");
  };

  const handleImportAdmins = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await apiPost("/import-users", formData);
      fetchAdmins();
      setImportFile(null);
      setImportModalOpen(false);
      toast.success(res.message || "Import successful");
    } catch (err) {
      toast.error("Import failed!");
    }
    setImportLoading(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalUsers}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search admin users"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 rounded-full"
          />
        </div>
        <div>
          <Link href="/dashboard/manage-admin-users/add-admin-user">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
          <Button className="ml-2" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
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
                    <TableHead>Email</TableHead>
                    <TableHead>Register Date</TableHead>
                    <TableHead>Admin Role</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length > 0 ? (
                    admins.map((admin, idx) => (
                      <TableRow key={admin._id || idx}>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {admin.createdAt
                            ? new Date(admin.createdAt)
                                .toLocaleDateString("en-GB")
                                .replace(/\//g, "-")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {admin.role === "0"
                            ? "Super Admin"
                            : admin.role === "3"
                            ? "Admin"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#7B61FF] text-[#7B61FF] hover:bg-[#f5f3ff] flex items-center gap-1"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                              onClick={() => handleDeleteAdmin(admin)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No admin users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      {!loading && totalUsers > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalUsers)} of {totalUsers}{" "}
            entries
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
                <SelectValue placeholder="10" />
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
          setDeleteDialog({ open: false, admins: [], loading: false })
        }
        onConfirm={confirmDelete}
        title={
          deleteDialog.admins.length > 1
            ? "Delete Admin Users"
            : "Delete Admin User"
        }
        description={
          deleteDialog.admins.length > 1
            ? `Are you sure you want to delete ${deleteDialog.admins.length} admin users? This action cannot be undone.`
            : "Are you sure you want to delete this admin user? This action cannot be undone."
        }
        loading={deleteDialog.loading}
      />

      {/* {importModalOpen && (
        <CustomModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title="Import Admin Users"
        >
          <form onSubmit={handleImportAdmins}>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 py-12 cursor-pointer transition hover:border-[#7B61FF] mb-6"
              onClick={() =>
                document.getElementById("import-admin-file-input").click()
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
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </span>
              <input
                id="import-admin-file-input"
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
                {importLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </CustomModal>
      )} */}

      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import"
        apiEndpoint="import-users"
        refetch={fetchAdmins}
      />
    </>
  );
};

export default AdminUserList;
