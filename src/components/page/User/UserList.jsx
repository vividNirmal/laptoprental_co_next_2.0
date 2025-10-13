"use client";
import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Eye,
  Trash2,
  Plus,
  Lock,
  Unlock,
  Check,
  Shield,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import { apiPost } from "@/lib/api"; // Make sure to import apiPost
import { CustomPagination } from "@/components/common/pagination";
import { useRouter } from "next/navigation";
import { BlockDialog } from "../../customComponents/BlockDialog";
import { StatusDialog } from "@/components/customComponents/StatusDialog";
import { DeleteConfirmationDialog } from "../../customComponents/DeleteDialog";
import { toast } from "sonner";
import Link from "next/link";
import CustomModal from "@/components/customComponents/CustomModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PAGE_SIZE_OPTIONS = [25, 50, 500, 1000];

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [blockDialog, setBlockDialog] = useState({
    open: false,
    type: 3,
    user: null,
    loading: false,
  });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    status: "Activate",
    user: null,
    loading: false,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    users: [],
    loading: false,
  });
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    user: null,
    loading: false,
  });  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);  
  
   const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null, // 0 for verify, 1 for approve
    user: null,
    loading: false,
    actionName: "", // "Approve" or "Verify"
  })
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `/get-user-list?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setUsers(response.data.data || []);
      setTotalUsers(response.data.totalUsers || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleViewUser = (user) => {
    router.push(`/dashboard/manage-users/${user._id}`);
  };
  const handleDeleteUser = (user) => {
    setDeleteDialog({ open: true, users: [user], loading: false });
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const url = "/admin-user-delete";
      const formData = new FormData();
      deleteDialog.users.forEach((user) => {
        formData.append("user_ids[]", user._id);
      });
      const res = await apiPost(url, formData);
      if (res.status === 1) {
        toast.success(res.message);
        setDeleteDialog({ open: false, users: [], loading: false });
        fetchUsers();
      }
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      console.error("Error deleting user(s):", error);
    }
  };

  const handleBlockUnblock = async (type, user) => {
    setBlockDialog({ ...blockDialog, loading: true });
    try {
      const url = `/user-action`;
      const formData = new FormData();
      formData.append("type", type);
      formData.append("user_id", user._id);
      const res = await apiPost(url, formData);
      if (res.status === 1) {
        toast.success(res.message);
        setBlockDialog({ ...blockDialog, open: false, loading: false });
        fetchUsers();
      }
    } catch (error) {
      setBlockDialog({ ...blockDialog, loading: false });
      toast.error(error.message || "Failed to block/unblock user");
    }
  };

  const handleStatusChange = async (status, user) => {
    setStatusDialog({ ...statusDialog, loading: true });
    try {
      // Example API call (customize as needed)
      // const url = `/user-status`;
      // const formData = new FormData();
      // formData.append("status", status);
      // formData.append("user_id", user._id);
      // await apiPost(url, formData);

      setStatusDialog({ ...statusDialog, open: false, loading: false });
      fetchUsers(); // Refresh user list
    } catch (error) {
      setStatusDialog({ ...statusDialog, loading: false });
      console.error("Error changing user status:", error);
    }
  };

  const handleAddUser = () => {
    router.push("/dashboard/manage-users/add-user");
  };

  
  // Combined function for both Approve and Verify actions
  const handleUserAction = async () => {
    setActionDialog({ ...actionDialog, loading: true })
    try {
      const url = `/user-action`
      const formData = new FormData()
      formData.append("type", actionDialog.type.toString()) // 0 for verify, 1 for approve
      formData.append("user_id", actionDialog.user._id)
      const res = await apiPost(url, formData)
      if (res.status === 1) {
        toast.success(res.message)
        setActionDialog({ open: false, type: null, user: null, loading: false, actionName: "" })
        fetchUsers()
      }
    } catch (error) {
      setActionDialog({ ...actionDialog, loading: false })
      toast.error(error.message || `Failed to ${actionDialog.actionName.toLowerCase()} user`)
    }
  }

  // Function to open approve dialog
  const handleApproveUser = (user) => {
    setActionDialog({
      open: true,
      type: 1, // Type 1 for approve
      user: user,
      loading: false,
      actionName: "Approve",
    })
  }

  // Function to open verify dialog
  const handleVerifyUser = (user) => {
    setActionDialog({
      open: true,
      type: 0, // Type 0 for verify
      user: user,
      loading: false,
      actionName: "Verify",
    })
  }
  return (
    <>
      {/* <div className="flex items-center space-x-3 ml-auto"></div> */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalUsers}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 rounded-full"
          />
        </div>
        <div>
          <Link href="/dashboard/manage-users/add-user">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
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
                    {/* <TableHead>Sr.No.</TableHead> */}
                    <TableHead>Email</TableHead>
                    <TableHead>Register Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Is Approved</TableHead>
                    <TableHead>Is Block</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={user._id || idx}>
                        {/* <TableCell>{(currentPage - 1) * selectedLimit + idx + 1}</TableCell> */}
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt)
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, "-")
                            : "-"}
                        </TableCell>
                        <TableCell>{user.location || "-"}</TableCell>
                        <TableCell>
                          {user.role === "2"
                            ? "Advance User"
                            : user.role === "1"
                              ? "User"
                              : "-"}
                        </TableCell>
                        <TableCell>{user.is_approved ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          {user.is_blocked === "Yes"
                            ? "Block"
                            : user.is_blocked === "No"
                              ? "Unblock"
                              : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                                                        {user.is_approved === "No" && (
                              <Button
                                size="sm"
                                className="bg-[#28c76f] text-white hover:bg-[#24b866]"
                                onClick={() => handleApproveUser(user)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}

                            {/* Verify Button - Only show if not verified */}
                            {user.is_verified === "No" && (
                              <Button
                                size="sm"
                                className="bg-[#091810] text-white hover:bg-[#0a1a12]"
                                onClick={() => handleVerifyUser(user)}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Verify
                              </Button>
                            )}
                            {/* Block/Unblock Button */}
                            {user.is_blocked === "Yes" ? (
                              <Button
                                size="sm"
                                className="bg-[#7B61FF] text-white hover:bg-[#6a50e6]"
                                onClick={() =>
                                  setBlockDialog({
                                    open: true,
                                    type: 3, // Unblock
                                    user: user,
                                    loading: false,
                                  })
                                }
                              >
                                Unblock
                                <Unlock className="ml-1 w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-[#7B61FF] text-white hover:bg-[#6a50e6]"
                                onClick={() =>
                                  setBlockDialog({
                                    open: true,
                                    type: 2, // Block
                                    user: user,
                                    loading: false,
                                  })
                                }
                              >
                                Block
                                <Lock className="ml-1 w-4 h-4" />
                              </Button>
                            )}
                            {/* View Button */}
                            <Button
                              size="sm"
                              className="bg-[#7B61FF] text-white hover:bg-[#6a50e6]"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {/* Delete Button */}
                            <Button
                              size="sm"
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {/* Status/Custom Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#7B61FF] text-[#7B61FF] hover:bg-[#f5f3ff]"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPasswordModal(true);
                              }}
                            >
                              <Check className="w-4 h-4" />
                              <span className="ml-1">P</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      {totalUsers > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalUsers)} of{" "}
            {totalUsers} entries
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

      <BlockDialog
        isOpen={blockDialog.open}
        onClose={() => setBlockDialog({ ...blockDialog, open: false })}
        onConfirm={() => handleBlockUnblock(blockDialog.type, blockDialog.user)}
        type={blockDialog.type}
        loading={blockDialog.loading}
        userName={blockDialog.user?.email}
      />

      <StatusDialog
        isOpen={statusDialog.open}
        onClose={() => setStatusDialog({ ...statusDialog, open: false })}
        onConfirm={() =>
          handleStatusChange(statusDialog.status, statusDialog.user)
        }
        status={statusDialog.status}
        loading={statusDialog.loading}
        userName={statusDialog.user?.email}
      />
      <StatusDialog
        isOpen={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null, user: null, loading: false, actionName: "" })}
        onConfirm={handleUserAction}
        status={actionDialog.actionName}
        loading={actionDialog.loading}
        userName={actionDialog.user?.email}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, users: [], loading: false })
        }
        onConfirm={confirmDelete}
        title={deleteDialog.users.length > 1 ? "Delete Users" : "Delete User"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} users? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        loading={deleteDialog.loading}
      />

      {showPasswordModal && (
        <CustomModal
          open={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          title="Change Password"
        >
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={Yup.object({
              password: Yup.string().required("Password is required"),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Confirm Password is required"),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const formData = new FormData();
                formData.append("user_id", selectedUser._id);
                formData.append("password", values.password);
                formData.append("type", 4);

                const res = await apiPost("/user-action", formData);
                if (res.status === 1) {
                  toast.success(res.message || "Password updated");
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  resetForm();
                } else {
                  toast.error(res.message || "Failed to update password");
                }
              } catch (err) {
                toast.error("Failed to update password");
              }
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Password
                  </Label>

                  <Field name="password">
                    {({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        className="pl-3"
                        autoComplete="new-password"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="mb-4">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Confirm Password
                  </Label>
                  <Field name="confirmPassword">
                    {({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="Confirm Password"
                        className="pl-3"
                        autoComplete="new-password"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded text-[#7B61FF] border-[#7B61FF] bg-white"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedUser(null);
                    }}
                    disabled={isSubmitting || passwordDialog.loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#7B61FF] text-white"
                    disabled={isSubmitting || passwordDialog.loading}
                  >
                    {isSubmitting || passwordDialog.loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /></>
                      : "Save"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </CustomModal>
      )}
    </>
  );
};

export default UserList;
