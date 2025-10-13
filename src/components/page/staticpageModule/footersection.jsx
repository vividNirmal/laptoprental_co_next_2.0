"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  footer_description: Yup.string("Description requir is required"),
});



export default function Footersection() {
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getRequest("get-seeting-details");
        formik.setValues({
          footer_description: response.data.footer_description,
        });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      footer_description: "", // array
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("footer_description", values.footer_description);
      try {
        let response;
        response = await postRequest("update-footer-description", formData);
        if (response.data) {
          toast.success(response.message || "Home footer Update  successfully!");
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
            htmlFor="footer_description"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Content
          </Label>
          <ReactQuill
            id="footer_description"
            name="footer_description"
            theme="snow"
            value={formik.values.footer_description}
            onChange={(value) => formik.setFieldValue("footer_description", value)}
            onBlur={(range, source, quill) => formik.setFieldTouched("footer_description", true)}
            modules={textEditormodule.modules}
            className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
          />
          {formik.touched.footer_description && formik.errors.footer_description && (
            <p className="text-red-500 text-xs">{formik.errors.footer_description}</p>
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
