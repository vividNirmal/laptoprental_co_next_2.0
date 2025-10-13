"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import CategorySelector from "@/components/common/categorySelector";
import { UploadCloud, X } from "lucide-react";
import { textEditormodule } from "@/lib/constant";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});


const validationSchema = Yup.object({
  author_name: Yup.string()
    .required("Author name is required")
    .max(250, "Author name must be at most 250 characters"),

  contact_no: Yup.string()
    .required("Contact number is required")
    .matches(/^[0-9\s,-]+$/, "Invalid contact number format"),

  content: Yup.string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),

  blog_title: Yup.string()
    .required("Blog title is required")
    .max(250, "Blog title must be at most 250 characters"),

  email: Yup.string().required("Email is required").email("Invalid email format"),

  categoryIds: Yup.array()
    .min(1, "At least one category must be selected")
    .required("Category is required"),  
});

export default function AddBlog({ id }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = React.useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getRequest("blog-category-list");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      author_name: "", // array
      contact_no: "", // array (can be comma-separated or multiselect)
      content: true, // boolean
      blog_title: "",
      email: "",
      categoryIds: "",
      images: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      values.categoryIds.forEach((id) => formData.append("categoryIds[]", id));
      formData.append("author_name", values.author_name);
      formData.append("contact_no", values.contact_no);
      formData.append("blog_title", values.blog_title);
      formData.append("email", values.email);
      formData.append("content", values.content);
      if (values.images instanceof File) {
        formData.append("images", values.images);
      }

      try {
        let response;
        if (id) {
          formData.append('blog_id', id);
          response = await postRequest(`update-blog-details`, formData);
        } else {
          response = await postRequest("add-blog-details", formData);
        }

        if (response.data) {
          toast.success(response.message || "Job saved successfully!");
          router.push("/dashboard/blog-list");
        }
      } catch (error) {
        console.error("Failed to save jobt:", error);
        toast.error("Failed to save job.");
      }
    },
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getRequest(`blog-details/${id}`);
        if (response.data) {
          const data = response.data.Blog;
          formik.setValues({
            categoryIds: data.categoryIds,
            author_name: data.author_name,
            blog_title: data.blog_title,
            email: data.email,
            address: data.address,
            content: data.content,            
            contact_no: data.contact_no,
          });
          if (data.images) {
            setImagePreviews({ src: data.images });      }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    if (id) {
      fetchJob();
    }
  }, [id, formik.setValues]);

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ].includes(file.type);

      if (!isValidSize) {
        toast.error(`File ${file.name} is too large (max 5MB).`);
        return;
      }
      if (!isValidType) {
        toast.error(`File ${file.name} has unsupported format.`);
        return;
      }

      setImagePreviews(null); // Clear existing preview
      formik.setFieldValue("images", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("images", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );
  const handleImageDrop = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );
  const handleRemoveImage = React.useCallback(() => {
    setImagePreviews(null); // Clear the preview
    formik.setFieldValue("images", null); // Clear the file from formik values
  }, [formik]);

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-wrap gap-3 2xl:gap-4">
          {/* Job Category */}
          <CategorySelector
            categories={categories}
            selectedCategories={formik.values.categoryIds}
            onSelectionChange={(selected) => formik.setFieldValue("categoryIds", selected)}
            label="Select Categories"
          />
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="author_name"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Author Name
              </label>
              <Input
                id="author_name"
                placeholder="author Name"
                maxLength={250}
                {...formik.getFieldProps("author_name")}
                className={
                  formik.touched.author_name && formik.errors.author_name ? "border-red-500" : ""
                }
              />
              {formik.touched.author_name && formik.errors.author_name && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.author_name}
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="contact_no"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Mobile
              </label>
              <Input
                id="contact_no"
                type="number"
                placeholder="Conatact Numer"
                maxLength={250}
                {...formik.getFieldProps("contact_no")}
                className={
                  formik.touched.contact_no && formik.errors.contact_no ? "border-red-500" : ""
                }
              />
              {formik.touched.contact_no && formik.errors.contact_no && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.contact_no}
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="email"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email "
                maxLength={250}
                {...formik.getFieldProps("email")}
                className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.email}
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="blog_title"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Blog Title
              </label>
              <Input
                id="blog_title"
                placeholder="Blog Title "
                maxLength={250}
                {...formik.getFieldProps("blog_title")}
                className={
                  formik.touched.blog_title && formik.errors.blog_title ? "border-red-500" : ""
                }
              />
              {formik.touched.blog_title && formik.errors.blog_title && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.blog_title}
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Blog Image
              </span>
              <span className="text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">
                Please upload your images in .webp format for faster loading
              </span>
            </div>
            <label
              htmlFor="banner-image-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.images && formik.errors.images ? "border-red-500" : "border-gray-300"
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
            >
              {imagePreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={imagePreviews.src || "/placeholder.svg"}
                    alt={`Banner Preview`}
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
              )}
              <input
                id="banner-image-upload"
                type="file"
                // Removed 'multiple' attribute
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                onBlur={formik.handleBlur}
                name="images"
              />
            </label>
            {formik.touched.images && formik.errors.images && (
              <div className="text-red-500 text-xs mt-1">
                {typeof formik.errors.images === "string"
                  ? formik.errors.images
                  : "Invalid image file."}
              </div>
            )}
          </div>
          <div className=" w-full flex-grow relative pb-3">
            <Label
              htmlFor="content"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Content
            </Label>
            <ReactQuill
              id="content"
              name="content"
              theme="snow"
              value={formik.values.content}
              onChange={(value) => formik.setFieldValue("content", value)}
              onBlur={(range, source, quill) => formik.setFieldTouched("content", true)}
              modules={textEditormodule.modules}
              className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-red-500 text-xs">{formik.errors.content}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="w-full mt-4">
            <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
