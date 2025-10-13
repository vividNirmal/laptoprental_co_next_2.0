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
import { Loader2, Trash2, Plus, Search, MoreHorizontal } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { Pagination } from "@/components/customComponents/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/customComponents/DeleteDialog";
import CustomModal from "@/components/customComponents/CustomModal";
import IpAddressForm from "./IpAddressForm";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";

const ManageIpAddress = () => {
  const [ipList, setIpList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalIps, setTotalIps] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    ip: null,
    loading: false,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const fetchIpList = async () => {
    setLoading(true);
    try {
      const url = `/ip-address-list?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setIpList(response.data.data || []);
      setTotalIps(response.data.totalLists || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setIpList([]);
      setTotalIps(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIpList();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleDeleteIp = (ip) => {
    setDeleteDialog({ open: true, ip, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const formData = new FormData();
      formData.append("type", 1);
      formData.append("ip_address_id[]", deleteDialog.ip._id);
      const res = await apiPost("/delete-ip-address", formData);
      if (res.status === 1) {
        toast.success(res.message);
        setDeleteDialog({ open: false, ip: null, loading: false });
        fetchIpList();
      }
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      // Optionally show error
    }
  };

  const handleAddNew = () => {
    setModalOpen(true);
  };

  const handleLogoutUser = () => {

  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-3xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search...."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 rounded-full"
          />
        </div>          
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
          <Button onClick={handleLogoutUser}>
            <Plus className="h-4 w-4 mr-2" />
            Logout All Users
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
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipList.length > 0 ? (
                    ipList.map((ip, idx) => (
                      <TableRow key={ip._id || idx}>
                        <TableCell>{ip.ip_address || "-"}</TableCell>
                        <TableCell>{ip.ip_holder_name || "-"}</TableCell>
                        <TableCell>{ip.device_type || "-"}</TableCell>
                        <TableCell className="">
                          <Button
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            onClick={() => handleDeleteIp(ip)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No IP addresses found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      {totalIps > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalIps)} of {totalIps}{" "}
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
          setDeleteDialog({ open: false, ip: null, loading: false })
        }
        onConfirm={confirmDelete}
        title={"Delete IP Address"}
        description={
          "Are you sure you want to delete this IP address? This action cannot be undone."
        }
        loading={deleteDialog.loading}
      />
      <CustomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Ip Address"
      >
        <IpAddressForm
          onSuccess={() => {
            setModalOpen(false);
            fetchIpList();
          }}
          CloseCancel = {setModalOpen}
        />
      </CustomModal>
    </>
  );
};

export default ManageIpAddress;
