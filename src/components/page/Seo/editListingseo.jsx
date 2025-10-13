"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const validationSchema = Yup.object({
  page_title: Yup.string().required("Page Title is required"),
  meta_title: Yup.string().required("Meta Title is required"),
  meta_keywords: Yup.string().nullable(),
  meta_description: Yup.string().nullable(),
});

const defaultInitialValues = {
  page_title: "",
  meta_title: "",
  meta_keywords: "",
  meta_description: "",
};

export default function EditListingseo({ id }) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState(defaultInitialValues);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("page_title", values.page_title);
        formData.append("meta_title", values.meta_title);
        formData.append("meta_keywords", values.meta_keywords || "");
        formData.append("meta_description", values.meta_description || "");

        formData.append("listing_id", id);

        const response = await postRequest("update-listing-seo", formData);
        if (response?.data) {
          router.push("/dashboard/seo-listing");
          toast.success(response.message || "Homepage SEO saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save category SEO:", error);
        toast.error("Failed to save category SEO.");
      }
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRequest(`get-listing-seo-details?listing_id=${id}`);
        const seo = res?.data.listing_seo_data;
        if (seo) {
          setInitialValues({
            page_title: seo.page_title || "",
            meta_title: seo.meta_title || "",
            meta_keywords: seo.meta_keywords || "",
            meta_description: seo.meta_description || "",
          });
        }
      } catch (err) {
        console.error("Error fetching category SEO:", err);
        toast.error("Failed to fetch category SEO data.");
      }
    };

    fetchData();
  }, [id]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="page_title" className="w-5/12 grow mb-0">
              Page Title
            </Label>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %area% for adding area
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %city% for adding city
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %location1% for adding location
            </Badge>
          </div>
          <div className="">
            <Input
              id="page_title"
              type="text"
              placeholder="Page Title"
              maxLength={250}
              {...formik.getFieldProps("page_title")}
              className={
                formik.touched.page_title && formik.errors.page_title ? "border-red-500" : ""
              }
            />
          </div>
          {formik.touched.page_title && formik.errors.page_title && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.page_title}</div>
          )}
        </div>

        {/* Meta Title */}
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="page_title" className="w-5/12 grow mb-0">
              Meta Title
            </Label>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %area% for adding area
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %city% for adding city
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %location1% for adding location
            </Badge>
          </div>
          <div className="">
            <Input
              id="meta_title"
              type="text"
              placeholder="Meta Title"
              maxLength={250}
              {...formik.getFieldProps("meta_title")}
              className={
                formik.touched.meta_title && formik.errors.meta_title ? "border-red-500" : ""
              }
            />
          </div>
          {formik.touched.meta_title && formik.errors.meta_title && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.meta_title}</div>
          )}
        </div>

        {/* Meta Keywords */}
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="page_title" className="w-5/12 grow mb-0">
              Meta Keywords
            </Label>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %area% for adding area
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %city% for adding city
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %location1% for adding location
            </Badge>
          </div>
          <div className="">
            <Textarea
              id="meta_keywords"
              placeholder="Meta Keywords"
              rows={4}
              {...formik.getFieldProps("meta_keywords")}
              className={
                formik.touched.meta_keywords && formik.errors.meta_keywords ? "border-red-500" : ""
              }
            />
          </div>
          {formik.touched.meta_keywords && formik.errors.meta_keywords && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.meta_keywords}</div>
          )}
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="page_title" className="w-5/12 grow mb-0">
              Meta Description
            </Label>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %area% for adding area
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %city% for adding city
            </Badge>
            <Badge variant="secondary" className="text-red-500 max-w-96 text-[10px]">
              Add %location1% for adding location
            </Badge>
          </div>
          <div className="">
            <Textarea
              id="meta_description"
              placeholder="Meta Description"
              rows={4}
              {...formik.getFieldProps("meta_description")}
              className={
                formik.touched.meta_description && formik.errors.meta_description
                  ? "border-red-500"
                  : ""
              }
            />
          </div>
          {formik.touched.meta_description && formik.errors.meta_description && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.meta_description}</div>
          )}
        </div>

        {/* Save Button */}
        <div className="">
          <Button
            type="submit"
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
