"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { textEditormodule } from "@/lib/constant";

const validationSchema = Yup.object({
  page_name: Yup.string().required("Page name is required"),
  page_content: Yup.string().required("Page Description is required"),

});

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});



export default function AddStaticpages({ id }) {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      page_name: "",
      page_content: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("page_name", values.page_name);
      formData.append("page_content", values.page_content);

      try {
        let response;
        if (id) {
          formData.append("static_page_id", id);
          response = await postRequest(`update-static-page-details`, formData);
        } else {
          response = await postRequest("save-static-page", formData);
        }
        if (response.data) {
          router.push("/dashboard/static-pages");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error("Failed to save product.");
      }
    },
  });
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await getRequest(`get-static-page-details/${id}`);
          if (response.data) {                        
            formik.setValues({
              page_name: response.data.Blog.page_name,
              page_content: response.data.Blog.page_content,
            });
          }
        } catch (error) {
          console.error("Failed to fetch product details:", error);
          toast.error("Failed to fetch product details.");
        }
      };
      fetchData();
    }
  }, [id]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        <div className="lg:w-[45%] w-full flex-grow">
          <div className="w-full relative pb-3.5">
            <Label
              htmlFor="page_name"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Page Name
            </Label>
            <Input
              id="page_name"
              type="text"
              placeholder="Enter From URL"
              maxLength={250}
              {...formik.getFieldProps("page_name")}
              className={
                formik.touched.page_name && formik.errors.page_name ? "border-red-500" : ""
              }
            />
            {formik.touched.page_name && formik.errors.page_name && (
              <div className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                {formik.errors.page_name}
              </div>
            )}
          </div>
        </div>
        <div className=" w-full flex-grow relative pb-3">
          <Label
            htmlFor="page_content"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Page content
          </Label>
          <ReactQuill
            id="page_content"
            name="page_content"
            theme="snow"
            value={formik.values.page_content}
            onChange={(value) => formik.setFieldValue("page_content", value)}
            onBlur={(range, source, quill) => formik.setFieldTouched("page_content", true)}
            modules={textEditormodule.modules}
            className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
          />
          {formik.touched.page_content && formik.errors.page_content && (
            <p className="text-red-500 text-xs">{formik.errors.page_content}</p>
          )}
        </div>
        {/* Save Button */}
        <div className="w-full mt-4">
          <Button
            type="submit"
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? <Loader/> : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
