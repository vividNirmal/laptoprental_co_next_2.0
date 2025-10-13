"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast, Toaster } from "sonner"
import { Trash2, Edit, Loader2 } from "lucide-react"
import { userGetRequestWithToken, userPostRequestWithToken } from "@/service/viewService" // Assuming this is available
import { CustomPagination } from "@/components/common/pagination"
import { AddEditProductForm } from "@/components/page/userPanel/Profile/addEditProductForm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog"
import Image from "next/image"
// Simple Dialog for Delete Confirmation

export default function ProductsContent() {
  const [addPopup, setAddPopup] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [productData, setProductData] = useState([])
  const [loader, setLoader] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDataCount, setTotalDataCount] = useState(0)
  const [selectedLimit, setSelectedLimit] = useState(25)
  const [searchQuery, setSearchQuery] = useState("")

  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Simulate Angular's BreakpointObserver
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 570)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const fetchProductList = useCallback(
    async (page, limit, search) => {
      setLoader(true)
      try {
        const res = await userGetRequestWithToken(`user-listing-product-list?search=${search}&page=${page}&limit=${limit}`)
        
        setProductData(res.data.data)
        setCurrentPage(res.data.currentPage)
        setTotalPages(res.data.totalPages)
        setTotalDataCount(res.data.totalUsers)
      } catch (error) {
        toast.error(error.message || "Failed to fetch product list.")
      } finally {
        setLoader(false)
      }
    },
    [userGetRequestWithToken],
  )

  useEffect(() => {
    fetchProductList(currentPage, selectedLimit, searchQuery)
  }, [currentPage, selectedLimit, searchQuery, fetchProductList])

  const handleAdd = (id) => {
    
    setEditId(id)
    setAddPopup(true)
  }

  const handlePopClose = () => {
    setAddPopup(false)
    setEditId(null)
  }

  const handleDeletePopOpen = (id) => {
    setDeleteId(id)
    setDeletePopup(true)
  }

  const handleDeletePopupClose = () => {
    setDeletePopup(false)
    setDeleteId(null)
  }

  const handleDelete = async () => {
       
    if (!deleteId) return

    const formdata = new FormData();
    formdata.append('product_ids[]', deleteId);
    setLoader(true) // Show loader during delete operation
    try {
        

      const res = await userPostRequestWithToken('delete-user-product', formdata);
      if(res.status == 1){
      toast.success(res.message || "Product deleted successfully!")
        handleDeletePopupClose()
        fetchProductList(currentPage, selectedLimit, searchQuery) // Refresh list
      }else{
      toast.error(res.message || "Product deleted successfully!")
        handleDeletePopupClose()
        fetchProductList(currentPage, selectedLimit, searchQuery) // Refresh list

      }
    } catch (error) {
      toast.error(error.message || "Failed to delete product.")
    } finally {
      setLoader(false)
    }
  }

    const handlePageSizeChange = (value) => {
    const newSize = Number(value);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  };

  const onPageChange = (page) => {
    setCurrentPage(page)
  }

  const onLimitChange = (limit) => {
    setSelectedLimit(limit)
    setCurrentPage(1) // Reset to first page when limit changes
  }

  const generateProductUrl = (item) => {
    const productSlug = item.product_name.trim().toLowerCase().replace(/\s+/g, "-")
    return `/pro-${productSlug}-${item.unique_id}`
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl 2xl:text-2xl font-bold mb-2">Product Management</h2>

      <div className="bg-white rounded-2xl w-full block p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <Button
            type="button"
            className="cursor-pointer bg-[#012B72] text-white text-xs md:text-base font-medium px-3.5 py-1.5 rounded-lg"
            onClick={() => handleAdd(null)}
          >
            Add new
          </Button>
          <div className="w-2/4 grow sm:max-w-96 sm:w-full flex items-center gap-2.5">
            <Input
              type="text"
              className="w-2/4 grow rounded-lg px-3 py-1.5 text-gray-500 text-xs md:text-base bg-white border border-solid border-gray-300 outline-none"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

       
                 { productData.length === 0 ? (
          <div className="text-center py-8">
            <Image
              src="/placeholder.svg?height=200&width=200"
              className="max-w-full block h-auto mx-auto"
              alt="data not found"
              width={300}
            height={300}
            />
            <h3 className="text-3xl font-medium text-gray-800 text-center mt-4">Data Not Found</h3>
          </div>
        ) : (
          <>
            {!isSmallScreen && (
              <div className="max-w-full overflow-auto">
                <Table className="min-w-[620px] w-full align-middle caption-bottom border-collapse">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2.5 px-2 text-xs 2xl:text-base font-medium text-left border-y border-l border-solid border-gray-200 rounded-tl-2xl rounded-bl-2xl">
                        Product Name
                      </TableHead>
                      <TableHead className="py-2.5 px-2 text-xs 2xl:text-base font-medium text-left border-y border-solid border-gray-200">
                        Listing Name
                      </TableHead>
                      <TableHead className="py-2.5 px-2 text-xs 2xl:text-base font-medium text-left border-y border-r border-solid border-gray-200 rounded-tr-2xl rounded-br-2xl">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productData.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="py-1.5 px-2 text-xs 2xl:text-base font-normal text-gray-500 text-left border-y border-l border-solid border-gray-200">
                          <a href={generateProductUrl(product)} className="text-[#012B72] hover:underline">
                            {product?.product_name}
                          </a>
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-xs 2xl:text-base font-normal text-gray-500 text-left border-y border-solid border-gray-200">
                          {product?.listing_ids?.name}
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-left border-y border-r border-solid border-gray-200">
                          <ul className="flex flex-wrap items-center gap-1.5">
                            <li>
                              <Button
                                type="button"
                                className="hidden md:flex bg-[#012B72] hover:bg-[#0056b3] text-white p-1.5 rounded-lg border-0 outline-none cursor-pointer transition-all duration-300 ease-linear"
                                onClick={() => handleAdd(product._id)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                              </Button>
                            </li>
                            <li>
                              <Button
                                type="button"
                                className="hidden md:flex bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg border-0 outline-none cursor-pointer transition-all duration-300 ease-linear"
                                onClick={() => handleDeletePopOpen(product._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {isSmallScreen && (
              <div className="flex flex-wrap gap-4 px-2 py-8">
                {productData.map((product) => (
                  <div
                    key={product._id}
                    className="relative w-full sm:w-1/3 sm:max-w-[50%] lg:w-1/4 grow lg:max-w-[33%] flex flex-col bg-white rounded-xl shadow-lg"
                  >
                    <div className="relative before:w-full before:block before:pt-[56.25%]">
                      <img
                        src={product?.product_image || "/placeholder.svg?height=200&width=300&query=product image"}
                        className="block absolute top-0 left-0 object-cover h-full max-w-full w-full rounded-t-xl"
                        alt="product img"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl lg:text-2xl font-medium mb-2">{product?.product_name}</h3>
                      <p className="text-xs font-normal mb-2">{product?.listing_ids?.name}</p>
                      <ul className="flex flex-wrap items-center justify-end gap-2">
                        <li>
                          <Button
                            type="button"
                            className="cursor-pointer bg-red-500 text-white text-xs 2xl:text-base font-medium px-3.5 py-1.5 rounded-lg min-w-20 text-center"
                            onClick={() => handleDeletePopOpen(product._id)}
                          >
                            Delete
                          </Button>
                        </li>
                        <li>
                          <Button
                            type="button"
                            className="cursor-pointer bg-[#012B72] text-white text-xs 2xl:text-base font-medium px-3.5 py-1.5 rounded-lg min-w-20 text-center"
                            onClick={() => handleAdd(product._id)}
                          >
                            Edit
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * selectedLimit + 1} to{" "}
          {Math.min(currentPage * selectedLimit, totalDataCount)} of {totalDataCount} entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select value={String(selectedLimit)} onValueChange={handlePageSizeChange}>
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
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
          </>
        )}
      </div>

      {/* <Dialog open={addPopup} onOpenChange={setAddPopup}> */}
        <AddEditProductForm
          isOpen={addPopup}
          onClose={handlePopClose}
          editId={editId}
          onSaveSuccess={() => fetchProductList(currentPage, selectedLimit, searchQuery)}
        />
      {/* </Dialog> */}

      <DeleteConfirmationDialog isOpen={deletePopup} onClose={handleDeletePopupClose} onConfirm={handleDelete} />
    </div>
  )
}
