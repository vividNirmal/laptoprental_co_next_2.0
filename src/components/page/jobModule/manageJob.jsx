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
import { Plus, Upload, Download, Trash2, Search, Edit, Eye, Loader2 } from "lucide-react";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import { toast } from "sonner";

export default function ManageJopbPage() {
  const [jobs, setJobs] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await postRequest(
        `get-job-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );

      setJobs(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
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
      setSelectedJob(new Set(jobs.map((user) => user._id)));
    } else {
      setSelectedJob(new Set());
    }
  };

  const handleSelectProduct = (userId) => {
    const newSelected = new Set(selectedJob);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedJob(newSelected);
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
      formData.append("job_ids[]", deleteDialog.users);
      const result = await postRequest("delete-jobs", formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        // setSelectedUsers(new Set());
        // fetchJobs(1, selectedLimit, searchTerm);
        fetchJobs();
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
          <Link href="/dashboard/job/add-job">
            <Button>
              <Plus className="size-4" />
              Add new
            </Button>
          </Link>

          {selectedJob.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="size-4" />
              Delete Selected ({selectedJob.size})
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
                    checked={selectedJob.size === jobs.length && jobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Unique Id</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Is Approved</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No jobs found.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedJob.has(job._id)}
                        onCheckedChange={() => handleSelectProduct(job._id)}
                      />
                    </TableCell>
                    <TableCell>{job.unique_id}</TableCell>
                    <TableCell className="font-medium">
                      {job.job_title}
                    </TableCell>
                    <TableCell>{job.salary}</TableCell>
                    <TableCell>{job.experience}</TableCell>
                    <TableCell>{job.address}</TableCell>
                    <TableCell>{job.is_approved === "true" ? "Yes" : "No"}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/job/add-job/${job._id}`}>
                        <Button size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(job._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button size="sm" variant="outline" className="p-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
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
        title={deleteDialog.users.length > 1 ? "Delete Product" : "Delete Product"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} users? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        loading={loading}
      />
    </>
  );
}
