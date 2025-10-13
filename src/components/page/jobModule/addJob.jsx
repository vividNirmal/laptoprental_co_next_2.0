"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import CategorySelector from "@/components/common/categorySelector"
import TagInput from "@/components/common/TagInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill to ensure it's client-side only
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});



const validationSchema = Yup.object({
  job_category_id: Yup.array().min(1, "At least one category is required"),
  keywords_tag: Yup.array().min(1, "Enter at least one keyword"),
  job_title: Yup.string().required("Job title is required"),
  experience: Yup.string().required("Experience is required"),
  salary: Yup.number().required("Salary is required"),
  address: Yup.string().required("Address is required"),
  phone_number: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  description: Yup.string().required("Description is required"),
  meta_title: Yup.string().required("Meta title is required"),
  meta_description: Yup.string().required("Meta description is required"),
  is_approved: Yup.boolean().required(),
});

export default function AddJobForm({ id }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getRequest("get-job-category-list");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      job_category_id: [],   // array
      keywords_tag: [],      // array (can be comma-separated or multiselect)
      is_approved: true,     // boolean
      job_title: "",
      experience: "",
      salary: "",
      address: "",
      phone_number: "",
      description: "",
      meta_title: "",
      meta_description: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      values.job_category_id.forEach((id) => formData.append("job_category_id[]", id));
      values.keywords_tag.forEach((tag) => formData.append("keywords_tag[]", tag));
      formData.append("is_approved", values.is_approved);
      formData.append("job_title", values.job_title);
      formData.append("experience", values.experience);
      formData.append("salary", values.salary);
      formData.append("address", values.address);
      formData.append("phone_number", values.phone_number);
      formData.append("description", values.description);
      formData.append("meta_title", values.meta_title);
      formData.append("meta_description", values.meta_description);

      try {
        let response;
        if (id) {
          response = await postRequest(`update-job-details/${id}`, formData);
        } else {
          response = await postRequest("store-job", formData);
        }

        if (response.data) {
          toast.success(response.message || "Job saved successfully!");
          router.push("/dashboard/job");
        }
      } catch (error) {
        console.error("Failed to save jobt:", error);
        toast.error("Failed to save job.");
      }
    }
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await postRequest(`get-job-details/${id}`);
        if (response.data) {
          const data = response.data;
          formik.setValues({
            job_category_id: data.job_category_id,
            job_title: data.job_title,
            experience: data.experience,
            salary: data.salary,
            address: data.address,
            phone_number: data.phone_number,
            keywords_tag: data.keywords_tag,
            is_approved: data.is_approved,
            description: data.description,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
          });
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    if (id) {
      fetchJob();
    }
  }, [id, formik.setValues]);

  return (
    <>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-wrap gap-3 2xl:gap-4">
          {/* Job Category */}
          <CategorySelector
            categories={categories}
            selectedCategories={formik.values.job_category_id}
            onSelectionChange={(selected) => formik.setFieldValue("job_category_id", selected)}
            label="Select Categories"
          />

          {/* Product Name */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="job_title" className="w-full lg:w-auto lg:min-w-60">Job Title</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="job_title"
                type="text"
                placeholder="Enter Job Title"
                maxLength={250}
                {...formik.getFieldProps("job_title")}
                className={
                  formik.touched.job_title && formik.errors.job_title
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.job_title && formik.errors.job_title && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.job_title}
                </div>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="experience" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Experience</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="experience"
                type="text"
                placeholder="Enter Experience"
                maxLength={250}
                {...formik.getFieldProps("experience")}
                className={
                  formik.touched.experience && formik.errors.experience
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.experience && formik.errors.experience && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.experience}
                </div>
              )}
            </div>
          </div>

          {/* salary */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="salary" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Salary</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="salarye"
                type="number"
                placeholder="Enter Salary"
                maxLength={250}
                {...formik.getFieldProps("salary")}
                className={
                  formik.touched.salary && formik.errors.salary
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.salary && formik.errors.salary && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.salary}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="address" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Address</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="address"
                type="text"
                placeholder="Enter Address"
                maxLength={250}
                {...formik.getFieldProps("address")}
                className={
                  formik.touched.address && formik.errors.address
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.address && formik.errors.address && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.address}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="phone_number" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Phone Number</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="phone_number"
                type="text"
                placeholder="Enter Phone Number"
                maxLength={250}
                {...formik.getFieldProps("phone_number")}
                className={
                  formik.touched.phone_number && formik.errors.phone_number
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.phone_number && formik.errors.phone_number && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.phone_number}
                </div>
              )}
            </div>
          </div>

          {/* Keyword Tag */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="keywords_tag" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Keyword Tag</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <TagInput value={formik.values.keywords_tag} onChange={(newTags) => formik.setFieldValue("keywords_tag", newTags)} />
              {formik.touched.keywords_tag && formik.errors.keywords_tag && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.keywords_tag}</div>
              )}
            </div>
          </div>

          {/* Is approved */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="keywords_tag" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Is approved</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Select
                value={formik.values.is_approved?.toString()}
                onValueChange={(value) => formik.setFieldValue("is_approved", value === "true")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select approval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.is_approved && formik.errors.is_approved && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.is_approved}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-wrap relative w-full items-start">
            <Label htmlFor="description" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Description</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <ReactQuill
                id="description"
                name="description"
                theme="snow"
                value={formik.values.description}
                onChange={(value) => formik.setFieldValue("description", value)}
                onBlur={(range, source, quill) =>
                  formik.setFieldTouched("description", true)
                }
                modules={textEditormodule.modules}
                className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-xs">{formik.errors.description}</p>
              )}
            </div>
          </div>

          {/* Meta Title */}
          <div className="flex flex-wrap relative w-full">
            <Label
              htmlFor="meta_title"
              className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60"
            >
              Meta Title
            </Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="meta_title"
                type="text"
                placeholder="Enter Meta Title"
                maxLength={250}
                {...formik.getFieldProps("meta_title")}
                className={
                  formik.touched.meta_title && formik.errors.meta_title ? "border-red-500" : ""
                }
              />
              {formik.touched.meta_title && formik.errors.meta_title && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.meta_title}
                </div>
              )}
            </div>
          </div>

          {/* Meta Description */}
          <div className="flex flex-wrap relative w-full">
            <Label htmlFor="meta_description" className="text-xs 2xl:text-base font-normal w-full lg:w-auto lg:min-w-60">Meta Description</Label>
            <div className="relative w-full lg:w-1/2 grow pb-4">
              <Input
                id="meta_description"
                type="text"
                placeholder="Enter Rating Count"
                maxLength={250}
                {...formik.getFieldProps("meta_description")}
                className={
                  formik.touched.meta_description && formik.errors.meta_description ? "border-red-500" : ""
                }
              />
              {formik.touched.meta_description && formik.errors.meta_description && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.meta_description}
                </div>
              )}
            </div>
          </div>
          {/* Save Button */}
          <div className="w-full mt-4">
            <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>{formik.isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </form>

    </>
  );
}
