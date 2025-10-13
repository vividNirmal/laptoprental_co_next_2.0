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
import { Loader2, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import { CustomPagination } from "@/components/common/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];

const LiveUserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `/get-live-user-list?search=${encodeURIComponent(
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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="text-xs text-muted-foreground">Total Entries : {totalUsers}</div>
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    <TableHead>Location</TableHead>
                    <TableHead>User Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={user._id || idx}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
                            : "-"}
                        </TableCell>
                        <TableCell>{user.location || "-"}</TableCell>
                        <TableCell>
                          {user.role === "0"
                            ? "Super Admin"
                            : user.role === "3"
                              ? "Admin"
                              : user.role === "2"
                                ? "Advance User"
                                : user.role === "1"
                                  ? "User"
                                  : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
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
            Showing {(currentPage - 1) * selectedLimit + 1} to {Math.min(currentPage * selectedLimit, totalUsers)} of {totalUsers} entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show</span>
            <Select
              value={String(selectedLimit)}
              onValueChange={value => { setSelectedLimit(Number(value)); setCurrentPage(1); }}
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
    </>
  );
};

export default LiveUserList;
