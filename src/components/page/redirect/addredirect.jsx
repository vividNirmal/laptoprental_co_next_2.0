"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {  getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import React from "react";

const validationSchema = Yup.object({
  from_url: Yup.string().required("url is required"),
  to_url: Yup.string().required("Url is required"),
});

function Addredirect({ id }) {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      from_url: "",
      to_url: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("from_url", values.from_url);
      formData.append("to_url", values.to_url);

      try {
        let response;
        if (id) {
          formData.append("redirect_id", id);
          response = await postRequest(`store-redirects-url`, formData);
        } else {
          response = await postRequest("store-redirects-url", formData);
        }
        if (response.data) {
          router.push("/dashboard/manage-redirects");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error("Failed to save product.");
      }
    },
  });

  React.useEffect(() => {
    const fetchBannerDetails = async () => {
      if (!id) return;
      try {
        const response = await getRequest(`redirect-details/${id}`);
        const data = response.data.Redirect;
        if (!data) return;
  
        formik.setValues({
          from_url: data.from_url || "",         
          to_url: data.to_url || "",
        });
      } catch (error) {
        console.error("Failed to fetch banner details:", error);
        toast.error("Failed to fetch banner details.");
      }
    };
  
    fetchBannerDetails();
  }, [id]);
  return (

    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        <div className="lg:w-5/12 w-full flex-grow">
          <div className="w-full relative pb-3.5">
            <Label htmlFor="from_url">From URL</Label>
            <Input
              id="from_url"
              type="text"
              placeholder="Enter From URL"
              maxLength={250}
              {...formik.getFieldProps("from_url")}
              className={
                formik.touched.from_url && formik.errors.from_url ? "border-red-500" : ""
              }
            />
            {formik.touched.from_url && formik.errors.from_url && (
              <div className="absolute -bottom-1.5 left-0 text-red-500 text-xs">{formik.errors.from_url}</div>
            )}
          </div>
        </div>
        <div className="lg:w-5/12 w-full flex-grow">
          <div className="w-full relative pb-3.5">
            <Label htmlFor="to_url">To URL</Label>
            <Input id="to_url" placeholder="Enter To URL" maxLength={250} {...formik.getFieldProps("to_url")} className={formik.touched.to_url && formik.errors.to_url ? "border-red-500" : ""} />
            {formik.touched.to_url && formik.errors.to_url && (
              <div className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                {formik.errors.to_url}
              </div>
            )}
          </div>
        </div>
        {/* Save Button */}
        <div className="w-full">
          <Button type="submit" className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear" disabled={formik.isSubmitting || !formik.isValid}>{formik.isSubmitting ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </form>

  );
}

export default Addredirect;
