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

// Validation schema for the form
const validationSchema = Yup.object({
  name: Yup.string().required("Country Name is required"),
})

export default function AddCountryPage({ countryId }) {
  const router = useRouter()
  const [submitLoader, setSubmitLoader] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "", // Slug is not directly editable but might be part of the data model
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitLoader(true)
      const formData = new FormData()
      formData.append("name", values.name)

      try {
        let response
        if (countryId) {
          response = await postRequest(`update-country/${countryId}`, formData)
          toast.success(response.message)
        } else {
          response = await postRequest("store-country", formData)
          if(response.status == 1){
          toast.success(response.message)
          }else{
            toast.error(response.message)
          }
        }
        router.push("/dashboard/countries") // Navigate after successful submission
      } catch (err) {
        // Handle API errors [^2]
        toast.error(err?.message || "Something went wrong")
      } finally {
        setSubmitLoader(false)
      }
    },
  })

  // Effect to fetch country data when in edit mode [^1]
  useEffect(() => {
    if (countryId) {
      const fetchCountryData = async () => {
        try {
          const response = await getRequest(`country-details/${countryId}`)
          if (response?.data?.Country) {
            formik.setValues({
              name: response.data?.Country.name || "",
              slug: response.data?.Country.slug || "",
            })
          }
        } catch (error) {
          toast.error(error?.message || "Failed to fetch country data.")
          console.error("Failed to fetch country data:", error)
        }
      }
      fetchCountryData()
    }
  }, [countryId]) // Re-run when countryId changes

  return (
    <div>

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            <div className="w-full">
              <div className="w-full relative pb-3.5">
                <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  Country Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Country Name"
                  maxLength={250}
                  {...formik.getFieldProps("name")}
                  className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="absolute bottom-0 left-0 text-red-500 text-xs">{formik.errors.name}</div>
                )}
              </div>
            </div>
            <div className="w-full mt-4">
              <Button
                type="submit"
                className={`cursor-pointer p-1.5 px-3 rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid transition-all duration-200 ease-linear ${
                  submitLoader ? "opacity-60 pointer-events-none" : ""
                }`}
                disabled={submitLoader || !formik.isValid}
              >
                {submitLoader ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
    </div>
  )
}
