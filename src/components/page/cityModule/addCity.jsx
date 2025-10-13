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
      state: Yup.string().required("This Field is Required."),
      name: Yup.string().required("This Field is Required")
})

export default function AddCityPage({ cityId }) {
  const router = useRouter()
  const [submitLoader, setSubmitLoader] = useState(false)
 const [allStates, setAllCountries] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      state: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitLoader(true)
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("state_id", values.state);

      try {
        let response
        if (cityId) {
          response = await postRequest(`update-city/${cityId}`, formData)
          if(response.status == 1){
          toast.success(response.message)
          router.push("/dashboard/manage-city")
          }else{
            toast.error(response.message)
          }
        } else {
          response = await postRequest("store-city", formData)
          if(response.status == 1){
          toast.success(response.message)
          router.push("/dashboard/manage-city")
          }else{
            toast.error(response.message)
          }
        }
        //router.push("/dashboard/manage-city") // Navigate after successful submission
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
      const res = await getRequest("get-form-state-list");
      setAllCountries(res.data);
    } catch (err) {
      console.error("Failed to load countries", err);
    }
  };
  loadCountries();
}, []);
  // Effect to fetch country data when in edit mode [^1]
  useEffect(() => {
    
    if (cityId && allStates.length > 0) {
      const fetchStateData = async () => {
        try {
          
          const response = await getRequest(`city-details/${cityId}`)
        
          const matchedState = allStates.find((c) =>
      typeof response?.data?.City?.state_id === "object"
        ? c.unique_id === response?.data?.City?.state_id.unique_id
        : c.unique_id === response?.data?.City?.state_id
    );

    if (!matchedState) {
      console.warn("Country not found for", response?.data?.City?.state_id);
    }

    formik.setValues({
      name: response?.data?.City?.name || "",
      state: matchedState?.unique_id || null,
    });
        } catch (error) {
          toast.error(error?.message || "Failed to fetch State data.")
          console.error("Failed to fetch State data:", error)
        }
      }
      fetchStateData()
    }
  }, [cityId, allStates]) // Re-run when cityId changes

  return (
    <div>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            <div className="w-full">
            <div className="w-full flex-grow">
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                State
              </Label>
              <CustomCombobox
                name="state"
                value={formik.values.state}
                onChange={(value) => formik.setFieldValue("state", value)}
                onBlur={() => formik.setFieldTouched("state", true)}
                valueKey="unique_id"
                labelKey="name"
                options={allStates || []}
                placeholder="Select State"
                id="state"
              />
              {formik.touched.state && formik.errors.state && (
                <p className="text-xs text-red-500">{formik.errors.state}</p>
              )}
            </div>                
              <div className="w-full relative pb-3.5">
                <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  City Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="City Name"
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
