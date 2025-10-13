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

const validationSchema = Yup.object({
  name: Yup.string().required("Page name is required"),
});

export default function AddBlogCategory({ id }) {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",      
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);      
      try {
        let response;
        if (id) {
          formData.append("blog_category_id", id);
          response = await postRequest(`update-blog-category`, formData);
        } else {
          response = await postRequest("store-blog-category", formData);
        }
        if (response.data) {
          router.push("/dashboard/blog-category");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error(error);
      }
    },
  });
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await getRequest(`edit-blog-category/${id}`);
          if (response.data) {            
            formik.setValues({
              name: response.data.name,              
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
              htmlFor="name"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Blog Category Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter From URL"
              maxLength={250}
              {...formik.getFieldProps("name")}
              className={
                formik.touched.name && formik.errors.name ? "border-red-500" : ""
              }
            />
            {formik.touched.name && formik.errors.name && (
              <div className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                {formik.errors.name}
              </div>
            )}
          </div>
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
