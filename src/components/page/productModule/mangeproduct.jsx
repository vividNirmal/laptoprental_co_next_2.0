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
import { Plus, Upload, Download, Trash2, Search, Edit, Eye, Loader2 } from "lucide-react";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import Link from "next/link";
import ExportButton from "@/components/common/exportbutton";
import { toast } from "sonner";

export default function ManageProductpage() {
  const [products, setProducts] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `listing-product-list?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
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
      formData.append("product_ids[]", deleteDialog.users);
      const result = await postRequest("delete-product-listing", formData);
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
          <Link href="/dashboard/manage-product/add-product">
            <Button>
              <Plus className="size-4" />
              Add new
            </Button>
          </Link>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="size-4" />
            Import
          </Button>

          <ExportButton endpoint="export-product" fileName="Products.csv" />

          {selectedProduct.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="size-4" />
              Delete Selected ({selectedProduct.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className="h-10 grow flex flex-row">
        <div className="rounded-lg border overflow-y-auto w-3xl grow custom-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedProduct.size === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Frontend view</TableHead>
                <TableHead>Product Unique Id</TableHead>              
                <TableHead>Product name</TableHead>
                <TableHead>Listing Name</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProduct.has(product._id)}
                        onCheckedChange={() => handleSelectProduct(product._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <a href={generateProductUrl(product)} target="_blank">
                        {generateProductUrl(product)}
                      </a>
                    </TableCell>
                    <TableCell>{product.unique_id}</TableCell>                  
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.product_listing_id?.name}</TableCell>
                    <TableCell>{product.product_category_id?.name}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/manage-product/add-product/${product._id}`}>
                        <Button size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Link href={`/dashboard/manage-product/view-product/${product._id}`}>
                        <Button size="sm" variant="outline" className="p-2 bg-transparent">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
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
        title="Product Import"
        apiEndpoint="/import-product"
        refetch={fetchProducts}
      />
    </>
  );
}
