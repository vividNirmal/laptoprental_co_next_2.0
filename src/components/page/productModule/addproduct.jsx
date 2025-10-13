"use client";
import { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, X } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill to ensure it's client-side only
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const isQuillEmpty = (value) => {
  return (
    !value ||
    value === "<p><br></p>" ||
    !value.replace(/<(.|\n)*?>/g, "").trim()
  );
};

const validationSchema = Yup.object({
  product_name: Yup.string().required("Product Name is required"),
  product_price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  product_listing_id: Yup.string().required("Listing is required"),
  product_category_id: Yup.string().required("Category is required"),
  product_description: Yup.string().test(
    "is-not-empty",
    "Description is required",
    (value) => !isQuillEmpty(value)
  ),
  ratingvalue: Yup.number()
    .typeError("Rating Value must be a number")
    .min(0, "Rating must be at least 0")
    .max(5, "Rating cannot exceed 5")
    .required("Rating count is required")
    .nullable(),
  ratingcount: Yup.number()
    .typeError("Rating Count must be a number")
    .min(0, "Count must be at least 0")
    .integer("Count must be an integer")
    .required("Rating count is required")
    .nullable(),
});

export default function AddProductForm({ id }) {
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = useState([]); // Array to hold image URLs for display
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await getRequest("get-all-listing");
        setListings(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await getRequest("get-admin-all-category-list");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchListings();
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      product_name: "",
      product_price: "",
      product_listing_id: "",
      product_category_id: "",
      product_image: [],
      product_description: "",
      ratingvalue: "",
      ratingcount: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("product_name", values.product_name);
      formData.append("product_price", values.product_price);
      formData.append("product_listing_id", values.product_listing_id);
      formData.append("product_category_id", values.product_category_id);
      formData.append("product_description", values.product_description);
      formData.append("ratingvalue", values.ratingvalue);
      formData.append("ratingcount", values.ratingcount);

      values.product_image.forEach((file) => {
        if (file instanceof File) {
          formData.append("product_image[]", file);
        } else {
          formData.delete("product_image[]");
        }
      });
      try {
        let response;
        if (id) {
          formData.append("product_id", id);
          response = await postRequest(`update-listing-product`, formData);
        } else {
          response = await postRequest("store-listing-product", formData);
        }

        if (response.data) {
          router.push("/dashboard/manage-product");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error("Failed to save product.");
      }
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getRequest(`listing-product-details/${id}`);
        if (response.data.productDetails) {
          const data = response.data.productDetails;
          formik.setValues({
            product_name: data.product_name,
            product_price: data.product_price,
            product_listing_id:
              data.product_listing_id?.listing_unique_id || "",
            product_category_id: data.product_category_id?.unique_id || "",
            product_image: [], // Formik values only hold new File objects, not existing URLs
            product_description: data.product_description,
            ratingvalue: data.ratingvalue,
            ratingcount: data.ratingcount,
          });
          // Set image previews for existing image(s)
          if (data.product_images) {
            // Add src key to data.product_images array
            if (data.product_images) {
              setImagePreviews(
                data.product_images.map((img) => ({
                  src: img,
                  isNew: false,
                }))
              );
            }
          } else {
            setImagePreviews([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, formik.setValues]);

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;

      const filesArray = Array.from(files);
      const validFiles = [];
      const imagePreviews = [];

      let remaining = filesArray.length;

      const finalizeUpdate = () => {
        // Safely merge new files with existing Formik values
        formik.setFieldValue("product_image", [
          ...(formik.values.product_image || []),
          ...validFiles,
        ]);
        setImagePreviews((prev) => [...prev, ...imagePreviews]);
      };

      filesArray.forEach((file) => {
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        const isValidType = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/svg+xml",
        ].includes(file.type);

        if (!isValidSize) {
          toast.error(`File ${file.name} is too large (max 5MB).`);
        }
        if (!isValidType) {
          toast.error(`File ${file.name} has unsupported format.`);
        }

        if (isValidSize && isValidType) {
          validFiles.push(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            imagePreviews.push({ src: reader.result, isNew: true, file });
            remaining--;
            if (remaining === 0) finalizeUpdate();
          };
          reader.readAsDataURL(file);
        } else {
          remaining--;
          if (remaining === 0) finalizeUpdate();
        }
      });
    },
    [formik, setImagePreviews]
  );

  const handleImageDrop = useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove) => {
      setImagePreviews((prevPreviews) => {
        const removedPreview = prevPreviews[indexToRemove];
        const updatedPreviews = prevPreviews.filter(
          (_, index) => index !== indexToRemove
        );
        if (removedPreview.isNew && removedPreview.file) {
          formik.setFieldValue("product_image", (prevFiles) =>
            prevFiles.filter((file) => file !== removedPreview.file)
          );
        }
        return updatedPreviews;
      });
    },
    [formik]
  );

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-wrap gap-4 2xl:gap-5">
          {/* Product Name */}
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="product_name"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Product Name
              </label>
              <Input
                id="product_name"
                type="text"
                placeholder="Product Name"
                maxLength={250}
                {...formik.getFieldProps("product_name")}
                className={
                  formik.touched.product_name && formik.errors.product_name
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.product_name && formik.errors.product_name && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.product_name}
                </div>
              )}
            </div>
          </div>
          {/* Price */}
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="product_price"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Price
              </label>
              <Input
                id="product_price"
                type="number"
                placeholder="Price"
                maxLength={250}
                {...formik.getFieldProps("product_price")}
                className={
                  formik.touched.product_price && formik.errors.product_price
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.product_price && formik.errors.product_price && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.product_price}
                </div>
              )}
            </div>
          </div>
          {/* Listing */}
          <div className="space-y-2 lg:w-[45%] w-full flex-grow">
            <Label
              htmlFor="product_listing_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Listing
            </Label>
            <CustomCombobox
              name="product_listing_id"
              value={formik.values.product_listing_id}
              onChange={(value) =>
                formik.setFieldValue("product_listing_id", value)
              }
              onBlur={() => formik.setFieldTouched("product_listing_id", true)}
              valueKey="listing_unique_id"
              labelKey="name"
              options={listings || []}
              placeholder="Select Listing"
              id="product_listing_id"
            />
            {formik.touched.product_listing_id &&
              formik.errors.product_listing_id && (
                <p className="text-xs text-red-500">
                  {formik.errors.product_listing_id}
                </p>
              )}
          </div>
          {/* Category */}
          <div className="space-y-2 lg:w-[45%] w-full flex-grow">
            <Label
              htmlFor="product_category_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Category
            </Label>
            <CustomCombobox
              name="product_category_id"
              value={formik.values.product_category_id}
              onChange={(value) =>
                formik.setFieldValue("product_category_id", value)
              }
              onBlur={() => formik.setFieldTouched("product_category_id", true)}
              valueKey="unique_id"
              labelKey="name"
              options={categories || []}
              placeholder="Select Category"
              id="product_category_id"
            />
            {formik.touched.product_category_id &&
              formik.errors.product_category_id && (
                <p className="text-xs text-red-500">
                  {formik.errors.product_category_id}
                </p>
              )}
          </div>
          {/* Product Image */}
          <div className="w-full flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Product Image
              </span>
              <span className="text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">
                Please upload your images in .webp format for faster loading
              </span>
            </div>
            <label
              htmlFor="product-image-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.product_image && formik.errors.product_image
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
            >
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 w-full h-full overflow-auto">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.src || "/placeholder.svg"}
                        alt={`Product Preview ${index + 1}`}
                        className="w-full h-32 object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG, GIF (MAX. 5MB per file)
                  </p>
                </div>
              )}
              <input
                id="product-image-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)} // ✅ Just this
                onBlur={formik.handleBlur}
                name="product_image"
              />
            </label>
            {formik.touched.product_image && formik.errors.product_image && (
              <div className="text-red-500 text-xs mt-1">
                {Array.isArray(formik.errors.product_image)
                  ? formik.errors.product_image.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))
                  : formik.errors.product_image}
              </div>
            )}
          </div>
          {/* Description */}
          <div className=" w-full flex-grow relative pb-3">
            <Label
              htmlFor="product_description"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Description
            </Label>
            <ReactQuill
              id="product_description"
              name="product_description"
              theme="snow"
              value={formik.values.product_description}
              onChange={(value) =>
                formik.setFieldValue("product_description", value)
              }
              onBlur={() => formik.setFieldTouched("product_description", true)}
              modules={textEditormodule.modules}
              className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
            />
            {formik.touched.product_description &&
              formik.errors.product_description && (
                <p className="text-red-500 text-xs">
                  {formik.errors.product_description}
                </p>
              )}
          </div>
          {/* Rating Value */}
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="ratingvalue"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Rating Value
              </label>
              <Input
                id="ratingvalue"
                type="text"
                placeholder="Enter Rating Value"
                maxLength={250}
                {...formik.getFieldProps("ratingvalue")}
                className={
                  formik.touched.ratingvalue && formik.errors.ratingvalue
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.ratingvalue && formik.errors.ratingvalue && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.ratingvalue}
                </div>
              )}
            </div>
          </div>
          {/* Rating Count */}
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="ratingcount"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Rating Count
              </label>
              <Input
                id="ratingcount"
                type="text"
                placeholder="Enter Rating Count"
                maxLength={250}
                {...formik.getFieldProps("ratingcount")}
                className={
                  formik.touched.ratingcount && formik.errors.ratingcount
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.ratingcount && formik.errors.ratingcount && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.ratingcount}
                </div>
              )}
            </div>
          </div>
          {/* Save Button */}
          <div className="w-full mt-4">
            <Button
              type="submit"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
              disabled={!formik.isValid}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
