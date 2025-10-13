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
      city: Yup.string().required("This Field is Required."),
      name: Yup.string().required("This Field is Required")
})

export default function AddAreaPage({ areaId }) {
  const router = useRouter()
  const [submitLoader, setSubmitLoader] = useState(false)
 const [allCities, setAllCities] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      city: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitLoader(true)
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("city_id", values.city);

      try {
        let response
        if (areaId) {
          response = await postRequest(`update-area/${areaId}`, formData)
          if(response.status == 1){
          toast.success(response.message)
          router.push("/dashboard/manage-area")
          }else{
            toast.error(response.message)
          }
        } else {
          response = await postRequest("store-area", formData)
          if(response.status == 1){
          toast.success(response.message)
          router.push("/dashboard/manage-area")
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
      const res = await getRequest("get-form-city-list");
      setAllCities(res.data);
    } catch (err) {
      console.error("Failed to load cities", err);
    }
  };
  loadCountries();
}, []);
  // Effect to fetch country data when in edit mode [^1]
  useEffect(() => {
    
    if (areaId && allCities.length > 0) {
      const fetchCityData = async () => {
        try {
            ;
          const response = await getRequest(`area-details/${areaId}`)
          ;
          const matchedCity = allCities.find((c) =>
      typeof response?.data?.Area?.city_id === "object"
        ? c.unique_id === response?.data?.Area?.city_id.unique_id
        : c.unique_id === response?.data?.Area?.city_id
    );

    if (!matchedCity) {
      console.warn("Area not found for", response?.data?.Area?.city_id);
    }

    formik.setValues({
      name: response?.data?.Area?.name || "",
      city: matchedCity?.unique_id || null,
    });
        } catch (error) {
          toast.error(error?.message || "Failed to fetch City data.")
          console.error("Failed to fetch City data:", error)
        }
      }
      fetchCityData()
    }
  }, [areaId, allCities]) // Re-run when areaId changes

  return (
    <div>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="flex flex-wrap gap-4 2xl:gap-5">
            <div className="w-full">
            <div className="w-full flex-grow">
              <Label
                htmlFor="city"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                City
              </Label>
              <CustomCombobox
                name="city"
                value={formik.values.city}
                onChange={(value) => formik.setFieldValue("city", value)}
                onBlur={() => formik.setFieldTouched("city", true)}
                valueKey="unique_id"
                labelKey="name"
                options={allCities || []}
                placeholder="Select City"
                id="city"
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-xs text-red-500">{formik.errors.city}</p>
              )}
            </div>                
              <div className="w-full relative pb-3.5">
                <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  Area Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Area Name"
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
