"use client";
import { useCallback, useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getRequest, postRequest } from "@/service/viewService";
import { cn } from "@/lib/utils";

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

export default function HomePageSEOForm() {
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

        const response = await postRequest("update-homepage-seo", formData);
        if (response?.data) {
          toast.success(response.message || "Homepage SEO saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save homepage SEO:", error);
        toast.error("Failed to save homepage SEO.");
      }
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRequest("get-homepage-seo-details");
        const seo = res?.data?.[0];
        if (seo) {
          setInitialValues({
            page_title: seo.page_title || "",
            meta_title: seo.meta_title || "",
            meta_keywords: seo.meta_keywords || "",
            meta_description: seo.meta_description || "",
          });
        }
      } catch (err) {
        console.error("Error fetching homepage SEO:", err);
        toast.error("Failed to fetch homepage SEO data.");
      }
    };

    fetchData();
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
      <div className="flex flex-col gap-5">
        {/* Page Title */}
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
          <div className="w-full relative">
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
            {formik.touched.page_title && formik.errors.page_title && (
              <div className="text-xs text-red-500 absolute -bottom-1 left-1">
                {formik.errors.page_title}
              </div>
            )}
          </div>
        </div>

        {/* Meta Title */}
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="meta_title" className="w-5/12 grow mb-0">
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
          <div className="w-full relative">
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
            {formik.touched.meta_title && formik.errors.meta_title && (
              <div className="text-xs text-red-500 absolute -bottom-1 left-1">
                {formik.errors.meta_title}
              </div>
            )}
          </div>
        </div>

        {/* Meta Keywords */}
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="meta_keywords" className="w-5/12 grow">
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
          <div className="w-full relative">
            <Textarea
              id="meta_keywords"
              placeholder="Meta Keywords"
              rows={4}
              {...formik.getFieldProps("meta_keywords")}
              className={cn(
                "min-h-20 2xl:min-h-28",
                formik.touched.meta_keywords && formik.errors.meta_keywords ? "border-red-500" : ""
              )}
            />
            {formik.touched.meta_keywords && formik.errors.meta_keywords && (
              <div className="text-xs text-red-500 absolute -bottom-1 left-1">
                {formik.errors.meta_keywords}
              </div>
            )}
          </div>
        </div>

        {/* Meta Description */}
        <div className="w-full">
          <div className="flex flex-wrap mb-1 space-x-1">
            <Label htmlFor="meta_description" className="w-5/12 grow mb-0">
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
          <div className="w-full relative">
            <Textarea
              id="meta_description"
              placeholder="Meta Description"
              rows={4}
              {...formik.getFieldProps("meta_description")}
              className={cn(
                "min-h-20 2xl:min-h-28",
                formik.touched.meta_description && formik.errors.meta_description
                  ? "border-red-500"
                  : ""
              )}
            />
            {formik.touched.meta_description && formik.errors.meta_description && (
              <div className="text-xs text-red-500 absolute -bottom-1 left-1">
                {formik.errors.meta_description}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="w-full">
          <Button
            type="submit"
            className="min-w-20"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
