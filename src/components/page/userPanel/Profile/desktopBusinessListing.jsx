"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MapPin, Edit, Trash2, MoreVertical } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { AddEditListingForm } from "@/components/page/userPanel/Profile/addEditListing"
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { userGetRequest, userGetRequestWithToken, userPostRequestWithToken } from "@/service/viewService"
import Image from "next/image"
import { CustomPagination } from "@/components/common/pagination"

export function DesktopBusinessListings() {
  const [listings, setListings] = useState([])
  const [pageloader, setPageloader] = useState(true)
  const [addEditPopupOpen, setAddEditPopupOpen] = useState(false)
  const [deletePopupOpen, setDeletePopupOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDataCount, setTotalDataCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")


  const fetchListings = useCallback(
    async (page, limit, search) => {
      setPageloader(true)
      try {
        const res = await userGetRequestWithToken(`get-user-listing-list?search=${search}&page=${page}&limit=${limit}`)

        setListings(res.data.data)
        setTotalDataCount(res.data.totalUsers)
        setTotalPages(res.data.totalPages)
        setCurrentPage(res.data.currentPage)
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch listings.",
          variant: "destructive",
        })
      } finally {
        setPageloader(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchListings(currentPage, itemsPerPage, searchTerm)
  }, [currentPage, itemsPerPage, searchTerm, fetchListings])

  const handleAdd = (id = null) => {
    setEditId(id)
    setAddEditPopupOpen(true)
  }

  const handlePopClose = () => {
    setAddEditPopupOpen(false)
    setEditId(null)
  }

  const handleDeletePopOpen = (id) => {
    setDeleteId(id)
    setDeletePopupOpen(true)
  }

  const handleDeletePopupClose = () => {
    setDeletePopupOpen(false)
    setDeleteId(null)
  }
  const handlePageSizeChange = (value) => {
    const newSize = Number(value);
    if (newSize !== itemsPerPage) {
      setItemsPerPage(newSize);
      setCurrentPage(1);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const formData = new FormData();
      formData.append('listing_ids[]', deleteId)

      const res = await userPostRequestWithToken('delete-user-listings', formData);
      if (res.status == 1) {
        toast.success(res.message || "Deleted successfully")
        handleDeletePopupClose()
        fetchListings(currentPage, itemsPerPage, searchTerm) // Re-fetch listings
      } else {
        toast.error(res.message || "Failed to delete")
      }
    } catch (error) {

    }
  }

  const joinCategory = (categories) => {
    return categories.map((cat) => cat.name).join(", ")
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">My Listing</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            className="bg-[#012B72] hover:bg-[#012B72] text-white flex items-center gap-2 w-full sm:w-auto"
            onClick={() => handleAdd(null)}
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </Button>
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search products"
              className="pl-10 pr-4 rounded-md bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {pageloader ? (
        <div className="container mx-auto">
          <div className="p-4 grid grid-cols-1 gap-4 [&>div]:!h-[101px] [&>div]:lg:!h-[120px] [&>div]:!rounded-xl [&>div]:!bg-white [&>div]:border [&>div]:border-solid [&>div]:border-white [&>div]:!m-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image
            src="/images/data-not-found.png"
            alt="No listings found"
            className="mb-6 max-w-full block h-auto mx-auto"
            width={200}
            height={200}
          />
          <p className="text-lg font-medium text-gray-700 mb-2">No Business Listings Found</p>
          <p className="text-xs text-gray-500 max-w-md">
            It looks like you haven't added any business listings yet. Click "Add Listing" to get started!
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3.5 md:gap-5">
          {listings.map((item) => (
            <li key={item._id} className="flex flex-wrap border border-solid border-gray-200 rounded-2xl bg-white">
              <div className="w-1/4 lg:w-1/5 shrink-0 p-1 md:p-3">
                <img
                  src={item.listing_image || "/placeholder.svg"}
                  className="rounded-lg lg:rounded-xl max-w-full size-full object-cover block text-xs"
                  alt={item.name}
                />
              </div>
              <div className="w-2/4 grow p-3 pl-2 md:p-4 xl:px-6 md:pl-4">
                {/* Header: Title + Badge + Actions */}
                <div className="flex items-center justify-between gap-2.5 mb-1">
                  <h3 className="text-base lg:text-xl font-semibold">{item.name}</h3>
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {item.approved ? (
                      <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium px-1 py-px sm:px-2 sm:py-1 rounded-full">Approved</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-medium px-1 py-px sm:px-2 sm:py-1 rounded-full">Unapprove</span>
                    )}
                    {/* Action buttons */}
                    <Button type="button" className="hidden md:flex bg-[#012B72] hover:bg-[#0056b3] text-white p-1 rounded-lg border-0 outline-none cursor-pointer transition-all duration-300 ease-linear" onClick={() => handleAdd(item._id)} size="icon">
                      <Edit className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      className="hidden md:flex bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg border-0 outline-none cursor-pointer transition-all duration-300 ease-linear"
                      onClick={() => handleDeletePopOpen(item._id)}
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="p-0 size-4 block md:hidden">
                          <MoreVertical className="size-full" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-28" align="end">
                        <DropdownMenuItem className="text-xs sm:text-xs" onClick={() => handleAdd(item._id)}>
                          <Edit className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs sm:text-xs" onClick={() => handleDeletePopOpen(item._id)}>
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs md:text-xs lg:text-base text-gray-600 mb-2 line-clamp-2">Category : {joinCategory(item.category_ids)}</p>
                <ul className="flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-4">
                  <li className="flex items-center justify-center gap-1.5 text-xs md:text-xs lg:text-base font-normal text-gray-600">
                    <MapPin className="size-3 md:size-4 shrink-0" />
                    <span className="block">{item.address}</span>
                  </li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
        <div className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalDataCount)} of {totalDataCount} entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select value={String(itemsPerPage)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[90px] bg-white">
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

      {/* {addEditPopupOpen && (<Dialog open={addEditPopupOpen} onOpenChange={handlePopClose}>
        <AddEditListingForm
          isOpen={addEditPopupOpen}
          onClose={handlePopClose}
          editId={editId}
          onSaveSuccess={() => fetchListings(currentPage, itemsPerPage, searchTerm)}
        />
      </Dialog>)} */}

      {addEditPopupOpen && (
        <AddEditListingForm
          isOpen={addEditPopupOpen}
          onClose={handlePopClose}
          editId={editId}
          onSaveSuccess={() => fetchListings(currentPage, itemsPerPage, searchTerm)}
        />)}
      {deletePopupOpen && (<DeleteConfirmationDialog isOpen={deletePopupOpen} onClose={handleDeletePopupClose} onConfirm={handleDelete} />)}
    </div>
  )
}
