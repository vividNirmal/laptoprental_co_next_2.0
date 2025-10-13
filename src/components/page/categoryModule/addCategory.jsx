"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ImageIcon, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { getRequest, postRequest } from "@/service/viewService";
import { textEditormodule } from "@/lib/constant";
import { CustomCombobox } from "@/components/common/customcombox";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export default function AddCategory({ categoryId }) {
  const iconInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      subdomain_slug: "",
      description: "",
      subdomain_description: "",
      unique_id: "",
      page_top_keyword: "",
      page_top_description: "",
      ratingvalue: "",
      ratingcount: "",
      related_categories: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Category Name is required"),
      slug: Yup.string().required("Category Slug is required"),
      subdomain_slug: Yup.string().required("Subdomain Slug is required"),
      description: Yup.string().nullable(),
      subdomain_description: Yup.string().nullable(),
      unique_id: Yup.string().required("Unique Id is required"),
      page_top_keyword: Yup.string().required("Page Top Keyword is required"),
      page_top_description: Yup.string().required(
        "Page Top Description is required"
      ),
      ratingvalue: Yup.number()
        .typeError("Rating Value must be a number")
        .required("Rating Value is required")
        .max(5, "Rating Value cannot be more than 5"),
      ratingcount: Yup.number()
        .typeError("Rating Count must be a number")
        .required("Rating Count is required"),
      related_categories: Yup.array()
        .min(1, "At least one category must be selected")
        .required("Category is required"),
    }),
    onSubmit: async (values) => {
      setSubmitLoader(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("subdomain_slug", values.subdomain_slug);
      formData.append("description", values.description);
      formData.append("subdomain_description", values.subdomain_description);
      formData.append("unique_id", values.unique_id);
      formData.append("page_top_keyword", values.page_top_keyword);
      formData.append("page_top_descritpion", values.page_top_description);
      formData.append("ratingvalue", values.ratingvalue);
      formData.append("ratingcount", values.ratingcount);
      values.related_categories.forEach((ele) => {
        formData.append("related_categories[]", ele);
      });

      if (values.icon instanceof File) {
        formData.append("desktop_image", values.icon);
      }
      if (values.coverImage instanceof File) {
        formData.append("mobile_image", values.coverImage);
      }

      let url;
      if (categoryId) {
        url = `update-catgeory/${categoryId}`;
      } else {
        url = "store-category";
      }

      try {
        const res = await postRequest(url, formData);
        toast.success(res.message);
        router.push("/dashboard/manage-category");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        toast.error(errorMessage);
      } finally {
        setSubmitLoader(false);
      }
    },
  });

  useEffect(() => {
    if (categoryId) {
      const fetchCategoryDetails = async () => {
        try {
          const res = await getRequest(`get-category-details/${categoryId}`);
          const data = res.data;

          const uniqueIds = data.related_categories.map(
            (item) => item.unique_id
          );
          formik.setValues({
            name: data.name,
            slug: data.slug,
            subdomain_slug: data.subdomain_slug,
            description: data.description,
            subdomain_description: data.subdomain_description,
            unique_id: data.unique_id,
            page_top_keyword: data.page_top_keyword,
            page_top_description: data.page_top_descritpion,
            ratingvalue: data.ratingvalue,
            ratingcount: data.ratingcount,
            icon: data.desktop_image,
            coverImage: data.mobile_image,
            related_categories: uniqueIds || [],
          });

          setIconPreview(data.desktop_image);
          setCoverPreview(data.mobile_image);
        } catch (error) {
          console.error("Failed to fetch category details:", error);
          toast.error("Failed to load category details.");
          router.push("/dashboard/manage-category");
        }
      };
      fetchCategoryDetails();
    }
    fetchCategories();
  }, [categoryId, router]);

  useEffect(() => {
    const nameValue = formik.values.name;
    const generatedSlug = nameValue
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!isSlugManuallyEdited || formik.values.slug === "") {
      formik.setFieldValue("slug", generatedSlug, false);
    }
  }, [formik.values.name, isSlugManuallyEdited, formik.values.slug]);

  const handleImageUpload = (e, field, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageDrop = (e, field, setPreview) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      formik.setFieldValue(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getRequest(`get-category-list`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch Areas:", error);
      setCategories([]);
      setTotalEntries(0);
    }
  };

  return (
    <>
      <div>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            {/* Category Name */}
            <div className="lg:w-5/12 w-full flex-grow">
              <Label htmlFor="name">Category Name</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="name"
                  type="text"
                  maxLength={250}
                  placeholder="Category Name"
                  {...formik.getFieldProps("name")}
                  className={
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                    {formik.errors.name}
                  </div>
                )}
              </div>
            </div>

            {/* Category Slug */}
            <div className="lg:w-5/12 w-full flex-grow">
              <Label htmlFor="slug">Category Slug</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="slug"
                  type="text"
                  maxLength={250}
                  placeholder="Category Slug"
                  {...formik.getFieldProps("slug")}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setIsSlugManuallyEdited(true); // Mark as manually edited
                  }}
                  className={
                    formik.touched.slug && formik.errors.slug
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.slug && formik.errors.slug && (
                  <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                    {formik.errors.slug}
                  </div>
                )}
              </div>
            </div>

            {/* Subdomain Slug */}
            <div className="lg:w-[45%] w-full flex-grow">
              <Label htmlFor="subdomain_slug">Subdomain Slug</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="subdomain_slug"
                  type="text"
                  maxLength={250}
                  placeholder="Subdomain Slug"
                  {...formik.getFieldProps("subdomain_slug")}
                  className={
                    formik.touched.subdomain_slug &&
                    formik.errors.subdomain_slug
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.subdomain_slug &&
                  formik.errors.subdomain_slug && (
                    <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                      {formik.errors.subdomain_slug}
                    </div>
                  )}
              </div>
            </div>

            {/* Unique Id */}
            <div className="lg:w-[45%] w-full flex-grow">
              <Label htmlFor="unique_id">Unique Id</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="unique_id"
                  type="text"
                  maxLength={250}
                  placeholder="Unique Id"
                  {...formik.getFieldProps("unique_id")}
                  className={
                    formik.touched.unique_id && formik.errors.unique_id
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.unique_id && formik.errors.unique_id && (
                  <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                    {formik.errors.unique_id}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap relative w-full overflow-hidden pb-3">
              <div className="w-full flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block">
                    Category Icon
                  </span>
                  <span className="text-[10px] 2xl:text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">
                    Please upload your images in .webp format for faster loading
                  </span>
                </div>

                {!iconPreview ? (
                  <label
                    htmlFor="iconUpload"
                    onDrop={(e) => handleImageDrop(e, "icon", setIconPreview)}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-6 h-6 text-gray-500 mb-2" />
                      <p className="mb-2 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      ref={iconInputRef}
                      id="iconUpload"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, "icon", setIconPreview)
                      }
                      //   accept=".webp,image/webp,.svg,.png,.jpg,.jpeg,.gif"
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={iconPreview}
                      alt="Icon Preview"
                      className="w-full h-full object-cover"
                      onDrop={(e) => handleImageDrop(e, "icon", setIconPreview)}
                      onDragOver={(e) => e.preventDefault()}
                    />
                    <div className="absolute inset-0 bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setIconPreview(null);
                          formik.setFieldValue("icon", null);
                        }}
                        className="text-white bg-red-600 px-3 py-1 rounded text-xs mb-2"
                      >
                        Remove
                      </button>
                      <span className="text-white text-xs">
                        Click or drop to replace
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="flex flex-wrap relative w-full overflow-hidden pb-3">
              <div className="w-full flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block">
                    Cover Image
                  </span>
                  <span className="text-[10px] 2xl:text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">
                    Please upload your images in .webp format for faster loading
                  </span>
                </div>
                {!coverPreview ? (
                  <label
                    htmlFor="coverUpload"
                    onDrop={(e) =>
                      handleImageDrop(e, "coverImage", setCoverPreview)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-6 h-6 text-gray-500 mb-2" />
                      <p className="mb-2 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      ref={coverInputRef}
                      id="coverUpload"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, "coverImage", setCoverPreview)
                      }
                      //accept=".webp,image/webp"
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onDrop={(e) =>
                        handleImageDrop(e, "coverImage", setCoverPreview)
                      }
                      onDragOver={(e) => e.preventDefault()}
                    />
                    <div className="absolute inset-0 bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview(null);
                          formik.setFieldValue("coverImage", null);
                        }}
                        className="text-white bg-red-600 px-3 py-1 rounded text-xs mb-2"
                      >
                        Remove
                      </button>
                      <span className="text-white text-xs">
                        Click or drop to replace
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 lg:w-[45%] w-full flex-grow">
              <Label
                htmlFor="related_categories"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Related Categories
              </Label>
              <CustomCombobox
                name="related_categories"
                value={formik.values.related_categories}
                onChange={(value) =>
                  formik.setFieldValue("related_categories", value)
                }
                onBlur={() =>
                  formik.setFieldTouched("related_categories", true)
                }
                multiSelect={true}
                valueKey="unique_id"
                labelKey="name"
                options={categories || []}
                placeholder="Select Related Categories"
                id="related_categories"
              />
              {formik.touched.related_categories &&
                formik.errors.related_categories && (
                  <p className="text-xs text-red-500">
                    {formik.errors.related_categories}
                  </p>
                )}
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2 w-full">
              <Label htmlFor="description">Description</Label>
              <div className="relative pb-3.5 w-full">
                <ReactQuill
                  id="description"
                  name="description"
                  theme="snow"
                  value={formik.values.description}
                  onChange={(value) =>
                    formik.setFieldValue("description", value)
                  }
                  onBlur={(range, source, quill) =>
                    formik.setFieldTouched("description", true)
                  }
                  modules={textEditormodule.modules}
                  className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:grow"
                />
                {formik.errors.description && formik.touched.description && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.description}
                  </div>
                )}
              </div>
            </div>

            {/* Subdomain Description */}
            <div className="col-span-1 md:col-span-2 w-full">
              <Label htmlFor="subdomain_description">
                Subdomain Description
              </Label>
              <div className="relative pb-3.5 w-full">
                <ReactQuill
                  id="subdomain_description"
                  name="subdomain_description"
                  theme="snow"
                  value={formik.values.subdomain_description}
                  onChange={(value) =>
                    formik.setFieldValue("subdomain_description", value)
                  }
                  onBlur={(range, source, quill) =>
                    formik.setFieldTouched("subdomain_description", true)
                  }
                  modules={textEditormodule.modules}
                  className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:grow"
                />
                {formik.errors.subdomain_description &&
                  formik.touched.subdomain_description && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.subdomain_description}
                    </div>
                  )}
              </div>
            </div>

            {/* Page Top Keyword */}
            <div className="lg:w-5/12 w-full flex-grow">
              <div className="w-full relative pb-3.5">
                <Label htmlFor="page_top_keyword">Page Top Keyword</Label>
                <Input
                  id="page_top_keyword"
                  type="text"
                  maxLength={250}
                  placeholder="Page Top Keyword"
                  {...formik.getFieldProps("page_top_keyword")}
                  className={
                    formik.touched.page_top_keyword &&
                    formik.errors.page_top_keyword
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.page_top_keyword &&
                  formik.errors.page_top_keyword && (
                    <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                      {formik.errors.page_top_keyword}
                    </div>
                  )}
              </div>
            </div>

            {/* Page Top Description */}
            <div className="lg:w-5/12 w-full flex-grow">
              <Label htmlFor="page_top_description">Page Top Description</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="page_top_description"
                  type="text"
                  maxLength={250}
                  placeholder="Page Top Description"
                  {...formik.getFieldProps("page_top_description")}
                  className={
                    formik.touched.page_top_description &&
                    formik.errors.page_top_description
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.page_top_description &&
                  formik.errors.page_top_description && (
                    <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                      {formik.errors.page_top_description}
                    </div>
                  )}
              </div>
            </div>

            {/* Rating Value */}
            <div className="lg:w-5/12 w-full flex-grow">
              <Label htmlFor="ratingvalue">Rating Value</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="ratingvalue"
                  type="number" // Changed back to number for numeric input
                  maxLength={250}
                  placeholder="Rating Value"
                  {...formik.getFieldProps("ratingvalue")}
                  className={
                    formik.touched.ratingvalue && formik.errors.ratingvalue
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.ratingvalue && formik.errors.ratingvalue && (
                  <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                    {formik.errors.ratingvalue}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Count */}
            <div className="lg:w-5/12 w-full flex-grow">
              <Label htmlFor="ratingcount">Rating Count</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="ratingcount"
                  type="number" // Changed back to number for numeric input
                  maxLength={250}
                  placeholder="Rating Count"
                  {...formik.getFieldProps("ratingcount")}
                  className={
                    formik.touched.ratingcount && formik.errors.ratingcount
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.ratingcount && formik.errors.ratingcount && (
                  <div className="absolute -bottom-1 left-0 text-red-500 text-xs">
                    {formik.errors.ratingcount}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full mt-6">
            <Button type="submit" disabled={submitLoader}>
              {submitLoader ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
