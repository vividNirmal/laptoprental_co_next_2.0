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
import { Pagination } from "@/components/customComponents/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];

const ActivityManage = () => {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const url = `/user-activity-list?user_type=Admin&search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setActivities(response.data.data || []);
      setTotalActivities(response.data.totalUsers || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, currentPage, selectedLimit]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="relative w-full max-w-2xs 2xl:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities"
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
                    {/* <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead> */}
                    <TableHead>Ip Address</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead>Login screens</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length > 0 ? (
                    activities.map((activity, idx) => (
                      <TableRow key={activity._id || idx}>
                        {/* <TableCell>{activity?.user_id?.name || "-"}</TableCell>
                        <TableCell>{activity?.user_id?.email || "-"}</TableCell> */}
                        <TableCell>{activity.ip_address || "-"}</TableCell>
                        <TableCell>{activity.country || "-"}</TableCell>
                        <TableCell>{activity.region || "-"}</TableCell>
                        <TableCell>{activity.city || "-"}</TableCell>
                        <TableCell>{activity.zipcode || "-"}</TableCell>
                        <TableCell>{activity.login_success || "-"}</TableCell>
                        <TableCell>
                          {activity.createdAt
                            ? new Date(activity.createdAt)
                                .toLocaleDateString("en-GB")
                                .replace(/\//g, "-")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No activity found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      {totalActivities > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
            {Math.min(currentPage * selectedLimit, totalActivities)} of{" "}
            {totalActivities} entries
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
    </>
  );
};

export default ActivityManage;
