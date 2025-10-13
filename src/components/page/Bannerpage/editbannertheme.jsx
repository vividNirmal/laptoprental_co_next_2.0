"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getRequest, postRequest } from "@/service/viewService";

const validationSchema = Yup.object({
  status: Yup.boolean().required("Status is required"),
  provide_name: Yup.string().required("Provider Name is required"),  
});

export default function EditBannerThemeForm({ id }) {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      status: false,
      provide_name: "",
      banner_type_code: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("status", values.status); // Convert boolean to 1 or 0
      formData.append("provide_name", values.provide_name);
      formData.append("banner_type_code[]", values.banner_type_code);

      try {
        let response;
        if (id) {
          formData.append("banner_theme_id", id);
          response = await postRequest(`update-banner-theme`, formData);
        }
        if (response.data) {
          toast.success(response.message || "Banner theme saved successfully!");
          router.push("/dashboard/banner-theme");
        }
      } catch (error) {
        console.error("Failed to save banner theme:", error);
        toast.error("Failed to save banner theme.");
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const fetchBannerTheme = async () => {
      if (!id) return;

      try {
        const response = await getRequest(`get-banner-theme-details/${id}`);
        if (response.data.BannerThemeDetails) {
          const data = response.data.BannerThemeDetails;
          formik.setValues({
            status: data.status || false,
            provide_name: data.provide_name || "",
            banner_type_code: data.banner_type_code || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch banner theme details:", error);
        toast.error("Failed to fetch banner theme details.");
      }
    };
    fetchBannerTheme();
  }, [id, formik.setValues]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        {/* Status on/off */}
        <div className="w-full flex items-center gap-3 mb-4">
          <Label htmlFor="status" className="text-xs 2xl:text-base font-normal text-slate-500">
            Status on/off
          </Label>
          <Switch
            id="status"
            checked={formik.values.status}
            onCheckedChange={(checked) => formik.setFieldValue("status", checked)}
            onBlur={() => formik.setFieldTouched("status", true)}
          />
          {formik.touched.status && formik.errors.status && (
            <p className="text-xs text-red-500">{formik.errors.status}</p>
          )}
        </div>

        {/* Provider name */}
        <div className="w-full">
          <div className="w-full relative pb-3.5">
            <label
              htmlFor="provide_name"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Provider name
            </label>
            <Input
              id="provide_name"
              type="text"
              placeholder="Provider name"
              maxLength={250}
              {...formik.getFieldProps("provide_name")}
              className={
                formik.touched.provide_name && formik.errors.provide_name ? "border-red-500" : ""
              }
            />
            {formik.touched.provide_name && formik.errors.provide_name && (
              <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                {formik.errors.provide_name}
              </div>
            )}
          </div>
        </div>

        {/* Banner Type HTML */}
        <div className="w-full flex-grow">
          <div className="w-full relative pb-3.5">
            <label
              htmlFor="banner_type_code"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Banner Type
            </label>
            <textarea
              id="banner_type_code"
              placeholder="<a class='ubm-banner' data-id='...'></a>"
              rows={6}
              {...formik.getFieldProps("banner_type_code")}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                formik.touched.banner_type_code && formik.errors.banner_type_code
                  ? "border-red-500"
                  : ""
              )}
            />
            {formik.touched.banner_type_code && formik.errors.banner_type_code && (
              <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                {formik.errors.banner_type_code}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="w-full mt-4 flex justify-end">
          <Button
            type="submit"
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
