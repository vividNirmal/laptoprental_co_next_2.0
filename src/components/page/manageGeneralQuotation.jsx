"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import fetchService from "@/service/fetchService";
import { CustomPagination } from "../common/pagination";
import { DeleteConfirmationDialog } from "../common/deleteDialog";
import { fileDownloadRequest, getRequest } from "@/service/viewService";
import { postRequest } from "@/service/viewService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ManageGeneralQuotationpage() {
  const router = useRouter();
  const [quotationList, setQuotationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exportLoader, setexportLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quotationType, setQuotationType] = useState(0); // Default to 'All Q'
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [viewAdminPopupOpen, setViewAdminPopupOpen] = useState(false);
  const [viewStatusPopupOpen, setViewStatusPopupOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [quotationStatusData, setQuotationStatusData] = useState(null);

  const typeOptions = [
    { id: 0, name: "All Q" },
    { id: 1, name: "User Q" },
    { id: 2, name: "Seller Q" },
  ];

  const fetchQuotation = useCallback(
    async (page, lim, search, startDt, endDt, qType) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          quotation_list_type: qType.toString(),
          start_date: startDt,
          end_date: endDt,
          search,
          page: page.toString(),
          limit: lim.toString(),
        });
        const res = await getRequest(`get-quotation-list?${params}`);
        const d = res.data;
        setQuotationList(d.data || []);
        setCurrentPage(d.currentPage);
        setTotalDataCount(d.totalLists);
      } catch (e) {
        toast.error(e.message || "Failed to fetch quotations.");
        setQuotationList([]);
        setTotalDataCount(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced fetch for search term
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchQuotation(
        currentPage,
        limit,
        searchTerm,
        startDate,
        endDate,
        quotationType
      );
    }, 0);
    return () => clearTimeout(debounceTimer);
  }, [
    currentPage,
    searchTerm,
    startDate,
    endDate,
    quotationType,
    limit,
    fetchQuotation,
  ]);

  const srNumber = (index) => {
    return (currentPage - 1) * limit + index + 1;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const categoryJoin = (arr) => {
    return arr?.map((item) => item.name).join(", ") || "";
  };

  const handleDeletepopOpen = (id) => {
    setSelectedQuotationId(id);
    setDeletePopupOpen(true);
  };
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value) => {
    const newSize = Number(value);
    if (newSize !== limit) {
      setLimit(newSize);
      setCurrentPage(1);
    }
  };
  const handleDelete = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("quotation_ids[]", selectedQuotationId);
      const res = await postRequest("delete-quotation", form);
      toast.success(res.message || "Quotation deleted successfully.");
      fetchQuotation(
        currentPage,
        limit,
        searchTerm,
        startDate,
        endDate,
        quotationType
      );
    } catch (error) {
      toast.error(
        error?.error?.message || "Something went wrong during deletion."
      );
    } finally {
      setLoading(false);
      setDeletePopupOpen(false);
      setSelectedQuotationId(null);
    }
  };

  const handleOpenStatuspop = (data) => {
    setQuotationStatusData(data);
    setViewStatusPopupOpen(true);    
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const newStatus =
        quotationStatusData.status === "approved" ? "pending" : "approved";
      formData.append("status", newStatus);
      formData.append("type", "1");
      formData.append("quotation_id", quotationStatusData._id);

      const res = await postRequest("update-quotation-status", formData);
      toast.success(res.message || "Status updated successfully.");
      fetchQuotation(
        currentPage,
        limit,
        searchTerm,
        startDate,
        endDate,
        quotationType
      );
    } catch (error) {
      toast.error(error?.error?.message || "Error updating status.");
    } finally {
      setLoading(false);
      setViewStatusPopupOpen(false);
      setQuotationStatusData(null);
    }
  };

  const handleViewAdminStatus = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("status", data.view_by_admin === "yes" ? "no" : "yes");
      formData.append("type", "2");
      formData.append("quotation_id", data._id);

      const res = await postRequest("update-quotation-status", formData);
      toast.success(res.message || "View status updated successfully.");
      fetchQuotation(
        currentPage,
        limit,
        searchTerm,
        startDate,
        endDate,
        quotationType
      );
    } catch (error) {
      toast.error(error?.error?.message || "Error updating view status.");
    } finally {
      setLoading(false);
      setViewAdminPopupOpen(false);
      setQuotationStatusData(null);
    }
  };

  const handleViewAdminStatuspopOpen = (data) => {
    setQuotationStatusData(data);
    setViewAdminPopupOpen(true);
    // If not viewed by admin, mark as viewed immediately
    if (data?.view_by_admin === "no") {
      handleViewAdminStatus(data);
    }
  };

  const handleCloseViewAdminStatusPopup = () => {
    setViewAdminPopupOpen(false);
    // If the status was 'no' and it was updated, refetch to reflect the change
    if (quotationStatusData?.view_by_admin === "no") {
      fetchQuotation(
        currentPage,
        limit,
        searchTerm,
        startDate,
        endDate,
        quotationType
      );
    }
    setQuotationStatusData(null);
  };

  const downloadPdf = async () => {
    setexportLoader(true);
    try {
      const form = new FormData();
      form.append("quotation_list_type", quotationType.toString());
      form.append("start_date", startDate);
      form.append("end_date", endDate);

      try {
        const res = await fileDownloadRequest("POST", "export-quotation", form);

        const url = window.URL.createObjectURL(res);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotations.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Quotations downloaded successfully.");
      } catch (e) {
        toast.error(e.message || "Failed to download quotations.");
      } finally {
        setexportLoader(false);
      }
    } catch (e) {
      toast.error(
        "No quotations found with the provided search criteria or download failed."
      );
    } finally {
      setexportLoader(false);
    }
  };

  const totalPages = Math.ceil(totalDataCount / limit);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap justify-end items-center gap-3.5 w-full mb-4">
        <div className="text-xs text-muted-foreground mr-auto">Total Entries : {totalDataCount}</div>
        <Select
          name="QuotationType"
          value={quotationType.toString()} // Ensure value is string for Select
          onValueChange={(val) => setQuotationType(Number(val))}
        >
          <SelectTrigger className="cursor-pointer xl:w-56 lg:w-48 w-full border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2">
            <SelectValue placeholder="Select a Quotation Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {typeOptions?.length > 0 ? (
                typeOptions.map((opt, index) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={index}
                    value={opt.id.toString()}
                  >
                    {opt.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled>No types available</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label htmlFor="startDate" className="text-xs text-gray-600">
            From
          </label>
          <Input
            id="startDate"
            type="date"
            className="lg:w-2/4 w-1/5 grow outline-none text-xs 2xl:text-base border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endDate" className="text-xs text-gray-600">
            To
          </label>
          <Input
            id="endDate"
            type="date"
            className="lg:w-2/4 w-1/5 grow outline-none text-xs 2xl:text-base border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={downloadPdf} disabled={exportLoader}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow">
          <Table className="text-left">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>View By Admin</TableHead>
                <TableHead>Quotation Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Quotation Date</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Listing Category</TableHead>
                <TableHead>Customer name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Is Approved</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : quotationList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                quotationList.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{srNumber(index)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleViewAdminStatuspopOpen(item)} className="text-[#7367f0] hover:text-[#7367f0]/80">
                        {item.view_by_admin !== "yes" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {item.view_by_admin !== "yes"
                            ? "Mark as viewed"
                            : "View details"}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell>{item.quotation_type}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger className="text-left w-40 whitespace-nowrap text-ellipsis overflow-hidden">
                          {categoryJoin(item.category_ids)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-96">
                          <p>{categoryJoin(item.category_ids)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="capitalize">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone_number}</TableCell>
                    <TableCell>{item.status == "approved" ? "Yes" : "No"}</TableCell>                
                    <TableCell className="flex items-center justify-center gap-2">
                      <Button size="sm" className={`w-fit gap-2.5 ${
                          item.status !== "approved"
                            ? "bg-[#28c76f] text-white hover:bg-[#28c76f]/90"
                            : "bg-red-500 text-white hover:bg-red-500/90"
                        }`}
                        onClick={() => handleOpenStatuspop(item)}
                      >
                        {item.status === "approved" && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {item.status !== "approved" && (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{item.status !== "approved" ? "Approve" : "Unapprove"}</span>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletepopOpen(item._id)}>
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalDataCount)} of {totalDataCount}{" "}
          entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select value={String(limit)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="10">10</SelectItem>                 */}
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>                                
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">entries</span>
          <CustomPagination currentPage={currentPage} totalPages={totalPages} totalDataCount={totalDataCount} listLength={quotationList.length} onPageChange={setCurrentPage} onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1);}} />
        </div>
      </div>

      <DeleteConfirmationDialog isOpen={deletePopupOpen} onClose={() => setDeletePopupOpen(false)} onConfirm={handleDelete} title="Delete Quotation" description="Are you sure you want to delete this quotation? This process cannot be undone." loading={loading} />
      {viewAdminPopupOpen && (
        <AlertDialog open={viewAdminPopupOpen} onOpenChange={handleCloseViewAdminStatusPopup}>
          <AlertDialogContent className="sm:max-w-2xl">
            <button onClick={handleCloseViewAdminStatusPopup} aria-label="Close" className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none" type="button">
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Quotation Details</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <table className="w-full border-collapse">
                <tbody>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">Listing Category</th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {categoryJoin(quotationStatusData?.category_ids)}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">Individual or Company</th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.quotation_type || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Quantity
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.quantity || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Customer Name
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.name || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Phone Number
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.phone_number || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Email
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.email || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200">
                    <th className="w-1/4 bg-white p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Location
                    </th>
                    <td className="w-3/4 bg-white p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.location || "N/A"}
                    </td>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <th className="w-1/4 p-2 text-left font-medium text-xs 2xl:text-base text-gray-800">
                      Message
                    </th>
                    <td className="w-3/4 p-2 text-left text-xs 2xl:text-base text-gray-500">
                      {quotationStatusData?.message || "N/A"}
                    </td>
                  </TableRow>
                </tbody>
              </table>
            </div>
            <AlertDialogFooter>
              <Button
                variant="secondary"
                onClick={handleCloseViewAdminStatusPopup}
              >
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {/* <QuotationDetailsDialog
        isOpen={viewAdminPopupOpen}
        onClose={handleCloseViewAdminStatusPopup}
        quotationStatusData={quotationStatusData}
      />

      <StatusChangeDialog
        isOpen={StatusChangeDialog}
        onClose={() => setViewStatusPopupOpen(false)}
        onConfirm={handleStatusChange}
        status={quotationStatusData?.status}
        loading={loading}
      /> */}
      {viewStatusPopupOpen && (
        <AlertDialog
          open={viewStatusPopupOpen}
          onOpenChange={() => setViewStatusPopupOpen(false)}
        >
          <AlertDialogContent>
            <button
              onClick={() => setViewStatusPopupOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Status</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to Change Status?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusChange}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
