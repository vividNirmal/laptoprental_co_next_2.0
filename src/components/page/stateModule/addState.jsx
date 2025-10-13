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
      country: Yup.string().required("This Field is Required."),
      name: Yup.string().required("This Field is Required")
})

export default function AddStatePage({ stateId }) {
  const router = useRouter()
  const [submitLoader, setSubmitLoader] = useState(false)
 const [allCountries, setAllCountries] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      country: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitLoader(true)
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("country_id", values.country);

      try {
        let response
        if (stateId) {
          response = await postRequest(`update-state/${stateId}`, formData)
          toast.success(response.message)
        } else {
          response = await postRequest("store-state", formData)
          if(response.status == 1){
          toast.success(response.message)
          }else{
            toast.error(response.message)
          }
        }
        router.push("/dashboard/states") // Navigate after successful submission
      } catch (err) {
        // Handle API errors [^2]
        toast.error(err?.message || "Something went wrong")
      } finally {
        setSubmitLoader(false)
      }
    },
  })
useEffect(() => {
  const loadCountries = async () => {
    try {
      const res = await getRequest("get-form-country-list");
      setAllCountries(res.data);
    } catch (err) {
      console.error("Failed to load countries", err);
    }
  };
  loadCountries();
}, []);
  // Effect to fetch country data when in edit mode [^1]
  useEffect(() => {
    
    if (stateId && allCountries.length > 0) {
      const fetchCountryData = async () => {
        try {
          
          const response = await getRequest(`state-details/${stateId}`)
        
          const matchedCountry = allCountries.find((c) =>
      typeof response?.data?.State?.country_id === "object"
        ? c.unique_id === response?.data?.State?.country_id.unique_id
        : c.unique_id === response?.data?.State?.country_id
    );

    if (!matchedCountry) {
      console.warn("Country not found for", response.country_id);
    }

    formik.setValues({
      name: response?.data?.State?.name || "",
      country: matchedCountry?.unique_id || null,
    });
        } catch (error) {
          toast.error(error?.message || "Failed to fetch State data.")
          console.error("Failed to fetch State data:", error)
        }
      }
      fetchCountryData()
    }
  }, [stateId, allCountries]) // Re-run when stateId changes

  return (
    <div>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            <div className="w-full">
            <div className="w-full flex-grow">
              <Label
                htmlFor="country"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Country
              </Label>
              <CustomCombobox
                name="country"
                value={formik.values.country}
                onChange={(value) => formik.setFieldValue("country", value)}
                onBlur={() => formik.setFieldTouched("country", true)}
                valueKey="unique_id"
                labelKey="name"
                options={allCountries || []}
                placeholder="Select Country"
                id="country"
              />
              {formik.touched.country && formik.errors.country && (
                <p className="text-xs text-red-500">{formik.errors.country}</p>
              )}
            </div>                
              <div className="w-full relative pb-3.5">
                <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  State Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="State Name"
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
                className={`cursor-pointer p-1.5 px-3rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid transition-all duration-200 ease-linear ${
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
