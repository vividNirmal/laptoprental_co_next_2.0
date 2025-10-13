"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { textEditormodule } from "@/lib/constant";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const validationSchema = Yup.object({
  desktop_description: Yup.string("Description requir is required"),
});


export default function Descriptioinsection() {
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getRequest("get-seeting-details");
        formik.setValues({
          desktop_description: response.data.desktop_description,
        });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      desktop_description: "", // array
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("desktop_description", values.desktop_description);
      try {
        let response;
        response = await postRequest("update-desktop-description", formData);
        if (response.data) {
          toast.success(response.message || "Job saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save jobt:", error);
        toast.error("Failed to save job.");
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-3 2xl:gap-4">
        {/* Description */}
        <div className=" w-full flex-grow relative pb-3">
          <Label
            htmlFor="desktop_description"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Content
          </Label>
          <ReactQuill
            id="desktop_description"
            name="desktop_description"
            theme="snow"
            value={formik.values.desktop_description}
            onChange={(value) => formik.setFieldValue("desktop_description", value)}
            onBlur={(range, source, quill) => formik.setFieldTouched("desktop_description", true)}
            modules={textEditormodule.modules}
            className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
          />
          {formik.touched.desktop_description && formik.errors.desktop_description && (
            <p className="text-red-500 text-xs">{formik.errors.desktop_description}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="w-full mt-4">
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
