"use client"

import { useState, useEffect, useCallback } from "react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CustomCombobox } from "@/components/common/customcombox"
import { toast } from "sonner"
import { Loader2, ImageUp, X, Rss } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSelector } from "react-redux"
import { userGetRequestWithToken, userPostRequestWithToken } from "@/service/viewService" // Assuming this is available

// Dynamically import ReactQuill to avoid SSR issues
import dynamic from "next/dynamic"
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export function AddEditProductForm({ isOpen, onClose, editId, onSaveSuccess }) {
  const [buttonLoader, setButtonLoader] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [listingList, setListingList] = useState([])
  const [productImageFiles, setProductImageFiles] = useState([])
  const [productImageUrls, setProductImageUrls] = useState([])
  const footerdate = useSelector((state) => state.setting.footerdata);
  const categoriesFromRedux = footerdate?.category_list || []  

  const editorConfig = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
      [{ header: [1, 2, 3, 4, 5, 6] }],
      ["link", "image"],
    ],
  }

  const initialValues = {
    product_name: "",
    product_description: "",
    product_price: "",
    product_category_id: null,
    product_listing_id: null,
  }
  const stripHtml = (html) => html.replace(/<[^>]*>?/gm, "").trim()

  const validationSchema = yup.object().shape({
    product_name: yup.string().required("Product Name is required").max(250, "Max 250 characters"),
      product_description: yup
    .string()
    .test("is-not-empty", "Description is required", (value) => !!stripHtml(value || "")),
    product_price: yup.string().required("Price is required"),
    product_category_id: yup.string().required("Category is required"),
    product_listing_id: yup.string().required("Product List is required"),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setButtonLoader(true)
      const formData = new FormData()
        
      formData.append("product_name", values.product_name)
      formData.append("product_description", values.product_description)
      formData.append("product_price", values.product_price)
      if (values.product_category_id) formData.append("product_category_id", values.product_category_id)
      if (values.product_listing_id) formData.append("product_listing_id", values.product_listing_id)

      productImageFiles.forEach((file) => {
        formData.append("product_image[]", file)
      })

      try {
        if (editId) {
          formData.append("product_id", editId)
          const res = await userPostRequestWithToken('update-user-product', formData);
            if(res.status == 1){
            toast.success(res.message || "Product updated successfully!")
            }else{
                toast.error(res.message || "Something went wrong");
            }
        } else {
          const res = await userPostRequestWithToken('store-product-by-user', formData)
          
                      if(res.status == 1){
            toast.success(res.message || "Product updated successfully!")
            }else{
                toast.error(res.message || "Something went wrong");
            }
        }
        onSaveSuccess()
        handleClose()
      } catch (error) {
        toast.error(error.message || "An error occurred. Please try again.")
      } finally {
        setButtonLoader(false)
      }
    },
  })

  const handleClose = useCallback(() => {
    formik.resetForm()
    
    setProductImageFiles([])
    setProductImageUrls([])
    onClose()
  }, [formik, onClose])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setCategoryList(categoriesFromRedux)
        const listingsRes = await userGetRequestWithToken('get-user-listing-list?type=2');
        setListingList(listingsRes.data.data)
      } catch (error) {
        toast.error("Failed to load initial data.")
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (isOpen && editId) {
        
      const fetchProductData = async () => {
        try {
          const res = await userGetRequestWithToken(`user-product-details/${editId}`)
          
          const data = res.data.productDetails
           const ok = categoryList.find((cat) => cat.unique_id === data.product_category_id?.unique_id) 
          formik.setValues({
            product_name: data.product_name,
            product_description: data.product_description,
            product_price: data.product_price,
            // product_category_id: categoryList.find((cat) => cat.unique_id === data.product_category_id?.unique_id) || null,
            product_category_id: data.product_category_id?.unique_id,
            // product_listing_id:
            //   listingList.find((list) => list.listing_unique_id === data.product_listing_id?.listing_unique_id) || null,
            product_listing_id: data.product_listing_id?.listing_unique_id,
          })
          setProductImageUrls(data.product_images || [])
          setProductImageFiles([]) // Clear file input on edit load
        } catch (error) {
          toast.error("Failed to load product details.")
          handleClose()
        }
      }
      fetchProductData()
    }
  }, [isOpen, editId])

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const newImageFiles = [...productImageFiles, ...files]
      setProductImageFiles(newImageFiles)

      const newImageUrls = []
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImageUrls.push(e.target?.result)
          if (newImageUrls.length === files.length) {
            setProductImageUrls((prev) => [...prev, ...newImageUrls])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (indexToRemove) => {
    setProductImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove))
    setProductImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    // Note: For existing images from backend, you might need a separate API call to remove them from the server.
    // The Angular code had a commented-out section for this.
  }

  const getFieldError = (field) => {
    return formik.touched[field] && formik.errors[field]
      ? (formik.errors)[field]
      : undefined
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
    <DialogContent className="w-full max-w-[90%] lg:max-w-4xl bg-white rounded-3xl pb-4">
      <DialogHeader>
        <DialogTitle className="text-xl">{editId ? "Edit Product" : "Add Product"}</DialogTitle>
      </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="w-full space-y-4 custom-scroll overflow-auto max-h-[75svh] pb-2 px-2">
          <div className="flex flex-wrap gap-2.5">
            <div className="flex flex-wrap items-center gap-1 w-full lg:gap-2.5 md:w-5/12 md:grow">
              <Label
                htmlFor="product_listing_id"
                className="text-xs 2xl:text-base font-normal text-gray-600 w-40 xl:w-48 shrink-0 block whitespace-nowrap"
              >
                Product List Category <span className="text-red-500">*</span>
              </Label>
              <CustomCombobox
                options={listingList}
                value={formik.values.product_listing_id}
                onChange={(val) => formik.setFieldValue("product_listing_id", val)}
                placeholder="Select Product List"
                valueKey="listing_unique_id"
                labelKey="name"
                className="w-full"
              />
              {getFieldError("product_listing_id") && (
                <div className="text-red-500 text-xs mt-1">{getFieldError("product_listing_id")}</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1 w-full lg:gap-2.5 md:w-5/12 md:grow">
              <Label
                htmlFor="product_category_id"
                className="text-xs 2xl:text-base font-normal text-gray-600 w-40 xl:w-48 shrink-0 block whitespace-nowrap"
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <CustomCombobox
                options={categoryList}
                value={formik.values.product_category_id}
                onChange={(val) => formik.setFieldValue("product_category_id", val)}
                placeholder="Select Category"
                valueKey="unique_id"
                labelKey="name"
                className="w-full"
              />
              {getFieldError("product_category_id") && (
                <div className="text-red-500 text-xs mt-1">{getFieldError("product_category_id")}</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1 w-full lg:gap-2.5 md:w-5/12 md:grow">
              <Label
                htmlFor="product_name"
                className="text-xs 2xl:text-base font-normal text-gray-600 w-40 xl:w-48 shrink-0 block whitespace-nowrap"
              >
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="product_name"
                maxLength={250}
                value={formik.values.product_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="product_name"
                placeholder="Enter Product Name"
                className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
              />
              {getFieldError("product_name") && (
                <div className="text-red-500 text-xs mt-1">{getFieldError("product_name")}</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1 w-full lg:gap-2.5 md:w-5/12 md:grow">
              <Label
                htmlFor="product_price"
                className="text-xs 2xl:text-base font-normal text-gray-600 w-40 xl:w-48 shrink-0 block whitespace-nowrap"
              >
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="product_price"
                maxLength={250}
                value={formik.values.product_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="product_price"
                placeholder="Enter Price"
                className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
              />
              {getFieldError("product_price") && (
                <div className="text-red-500 text-xs mt-1">{getFieldError("product_price")}</div>
              )}
            </div>
            <div className="gap-2.5 w-full">
              <Label
                htmlFor="product_description"
                className="text-xs 2xl:text-base font-normal text-gray-600 w-full lg:w-40 xl:w-48 shrink-0 block whitespace-nowrap"
              >
                Description <span className="text-red-500">*</span>
              </Label>
              <ReactQuill
                theme="snow"
                value={formik.values.product_description}
                onChange={(content) => formik.setFieldValue("product_description", content)}
                onBlur={() => formik.setFieldTouched("product_description", true)}
                modules={editorConfig}
                placeholder="Product Description....."
                className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
              />
              {getFieldError("product_description") && (
                <div className="text-red-500 text-xs mt-1">{getFieldError("product_description")}</div>
              )}
            </div>
            <div className="w-full flex-grow">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">Product Image</span>
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {productImageUrls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageUp className="w-10 h-10 text-gray-400" />
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-5 pb-6 gap-2 flex-wrap">
                    {productImageUrls.map((item, index) => (
                      <div key={index} className="relative">
                        <img
                          src={item || "/placeholder.svg"}
                          alt={`Product ${index}`}
                          className="object-cover rounded-xl h-24 w-24"
                        />
                        <button
                          type="button"
                          className="cursor-pointer absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(index)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="w-24 h-24 border border-[#d5d8df] flex items-center justify-center rounded-xl">
                      <ImageUp className="text-[#7367f0] text-4xl" />
                    </div>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple // Allow multiple file selection
                />
              </label>
            </div>
          </div>
        </form>
        <DialogFooter className={"border-t border-solid border-zinc-200 pt-2.5"}>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit"  onClick={() => formik.handleSubmit()}
          disabled={buttonLoader}>{buttonLoader ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Product</Button>
          </DialogFooter>
        {/* <Button
          type="button"
          
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => formik.handleSubmit()}
          disabled={buttonLoader}
        >
          {buttonLoader ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Product
        </Button> */}
    </DialogContent>
    </Dialog>
  )
}
