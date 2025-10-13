"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getRequest, postRequest } from "@/service/viewService" // Your API service
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CustomCombobox } from "@/components/common/customcombox"

// Validation schema for the form
const validationSchema = Yup.object({
      category: Yup.string().required("This Field is Required."),
})

export default function AddJobCategorySortingPage() {
  const router = useRouter()
  const [submitLoader, setSubmitLoader] = useState(false)
 const [allCategories, setallCategories] = useState([]);

  const formik = useFormik({
    initialValues: {
      category: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitLoader(true)
      const formData = new FormData();
      formData.append('type', '1');
      formData.append('category_id', values.category);

      try {
        let response;
          response = await postRequest(`job-category-action`, formData)
          if(response.status == 1){
          toast.success(response.message)
          router.push("/dashboard/job-sorting")
          }else{
            toast.error(response.message)
          }
      } catch (err) {
        // Handle API errors [^2]
        toast.error(err?.message || "Something went wrong")
      } finally {
        setSubmitLoader(false)
      }
    },
  })
useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await getRequest("get-disable-job-category-list");
      setallCategories(res.data);
    } catch (err) {
      console.error("Failed to load Categories", err);
    }
  };
  loadCategories();
}, []);

  return (

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            <div className="w-full">
            <div className="w-full flex-grow">
              <Label
                htmlFor="category"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Job Category
              </Label>
              <CustomCombobox
                name="category"
                value={formik.values.category}
                onChange={(value) => formik.setFieldValue("category", value)}
                onBlur={() => formik.setFieldTouched("category", true)}
                valueKey="_id"
                labelKey="name"
                options={allCategories || []}
                placeholder="Select Category"
                id="category"
              />
              {formik.touched.category && formik.errors.category && (
                <p className="text-xs text-red-500">{formik.errors.category}</p>
              )}
            </div>                
            </div>
            <div className="w-full mt-4">
              <Button
                type="submit"
                disabled={submitLoader || !formik.isValid}
              >
                {submitLoader ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>

  )
}
