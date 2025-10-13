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
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import ExportButton from "@/components/common/exportbutton";
import { toast } from "sonner";
import moment from "moment";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export default function ManagePremiumListingpage() {
  const [products, setProducts] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const dateFormat = (data) => {
    return moment(data).format("DD-MM-YYYY");
  };
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `get-chat-boat-listing?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      );
      setProducts(response.data.data || []);
      setTotalEntries(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
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

  const generateProductUrl = (item) => {
    const productSlug = item.product_name.trim().toLowerCase().replace(/\s+/g, "-");

    return `/pro-${productSlug}-${item.unique_id}`;
  };
    const handleChangePrimeListing = (type) => {
        if (type.includes('_')) {
            return type.replace(/_/g, ' ');
        } else {
            return type;
        }
    };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProduct(new Set(products.map((user) => user._id)));
    } else {
      setSelectedProduct(new Set());
    }
  };

  const handleSelectProduct = (userId) => {
    const newSelected = new Set(selectedProduct);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedProduct(newSelected);
  };
  const handleBulkDelete = () => {
    if (selectedProduct.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedProduct) });
    }
  };
  const handleDelete = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("chatboat_ids[]", deleteDialog.users);
      const result = await postRequest("delete-chatoat-listing", formData);
      if (result.status == 1) {
        toast.success("Success", { description: `${result.message}` });
        setSelectedProduct(new Set());
        fetchProducts(1, pageSize, searchTerm);
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Error", { description: `${error}` });
    }
  };
      const getListingNames = (listings) => {
        return listings?.map(listing => listing.name).join(', ') || '';
    }

  return (
    <>
      {/* <div className=""> */}
        {/* <Card >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <h2 className="text-2xl font-semibold">Manage Product</h2>
              <span className="text-muted-foreground text-xs">Home &raquo; Manage Product</span>
            </div>
            <div className="relative w-full max-w-2xs 2xl:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div> */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="text-xs text-muted-foreground">Total Entries : {totalEntries}</div>
            <div className="relative w-full max-w-3xs 2xl:max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 rounded-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/chatbot-listing/add-chatbot">
                  <Button>
                    <Plus className="size-4" />
                    Add new
                  </Button>
                </Link>
                {selectedProduct.size > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="size-4" />
                    Delete Selected ({selectedProduct.size})
                  </Button>
                )}
            </div>
          </div>

          <div className="h-10 grow flex flex-row">
            <div className="rounded-lg border overflow-y-auto w-3xl grow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedProduct.size === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No Records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((item,index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProduct.has(item._id)}
                            onCheckedChange={() => handleSelectProduct(item._id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.is_city_select_all ? 'All' : item.city_id[0]?.name}
                        </TableCell>
                        {/* <TableCell>{getListingNames(item?.listing_id)}</TableCell> */}
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger className="text-left w-150 whitespace-nowrap text-ellipsis overflow-hidden">
                              {getListingNames(item.listing_id)}
                            </TooltipTrigger>
                            <TooltipContent className="max-w-96">
                              <p>{getListingNames(item?.listing_id)}</p>
                            </TooltipContent>
                          </Tooltip>   
                        </TableCell>                     
                        <TableCell className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/chatbot-listing/add-chatbot/${item._id}`}>
                            <Button
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item._id)}
                          >
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
        {/* </Card>
      </div> */}
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
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Premium Listing Import"
        apiEndpoint="premium-listing-import"
        refetch={fetchProducts}
      />
    </>
  );
}
