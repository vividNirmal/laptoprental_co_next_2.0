"use client"

import { useEffect, useState, useCallback } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useParams, useRouter } from "next/navigation"
import { getRequest, postRequest } from "@/service/viewService"
import { toast } from "sonner"
import { CustomCombobox } from "@/components/common/customcombox" // Corrected import path
import { Label } from "@/components/ui/label" // Using Label from shadcn/ui
import { cn } from "@/lib/utils" 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddPremiumUser({premiumListingId}) {
  const [listingList, setListingList] = useState([])
  const [cityList, setCityList] = useState([])
  const [addDate, setAddDate] = useState(false)
  const [addCity, setAddCity] = useState(false)
  const [selectedStateForCity, setSelectedStateForCity] = useState(null) // State to hold selected state for city fetching
 const premimumType = [
  { id: 'super_premium', name: 'Super Premium' },
  { id: 'epremium', name: 'ePremium' },
];

  const params = useParams()
  const router = useRouter()
  const id = premiumListingId // Get ID from URL for edit mode
  const isEditMode = !!id
  const validationSchema = Yup.object({
    type: Yup.string().required("Type is required"),
    listing_id: Yup.string().required("Listing is required"),
    // city_id: Yup.string().when("type", {
    //   is: "epremium",
    //   then: Yup.string().required("City is required"),
    //   otherwise: Yup.string().nullable(),
    // }),
    // start_date: Yup.string().when("type", {
    //   is: "epremium",
    //   then: Yup.string().required("Start date is required"),
    //   otherwise: Yup.string().nullable(),
    // }),
    // end_date: Yup.string().when("type", {
    //   is: "epremium",
    //   then: Yup.string().required("End date is required"),
    //   otherwise: Yup.string().nullable(),
    // }),
  });
  const formik = useFormik({
    initialValues: {
      listing_id: '',
      premium_type: '',
      city_ids: '', // This will hold a single city object for single select
      starting_date: "",
      endding_date: "",
    },
    validationSchema: Yup.object({
      listing_id: Yup.string().required("Listing is required"),
      premium_type: Yup.string().required("Premium Type is required"),
  city_ids: Yup.string().when('premium_type', {
    is: 'epremium',
    then: (schema) => schema.required('City is required for epremium'),
    otherwise: (schema) => schema.notRequired(),
  }),

  starting_date: Yup.string().when('premium_type', {
    is: 'epremium',
    then: (schema) => schema.required('Start date is required for epremium'),
    otherwise: (schema) => schema.notRequired(),
  }),

  endding_date: Yup.string().when('premium_type', {
    is: 'epremium',
    then: (schema) => schema.required('End date is required for epremium'),
    otherwise: (schema) => schema.notRequired(),
  }),      
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const formData = new FormData()
      if (values.listing_id) {
        formData.append("listing_id", values.listing_id)
      }
      if (values.premium_type) {
        formData.append("premium_type", values.premium_type)
      }

      if (addDate) {
        formData.append("start_date", values.starting_date)
        formData.append("end_date", values.endding_date)
      }
      if (addCity && values.city_ids) {
        formData.append("city_ids[]", values.city_ids) // Assuming city_ids is a single object
      }

      const endpoint = isEditMode ? "update-premium-listing" : "store-premium-listing"
      if (isEditMode) {
        formData.append("premium_listing_id", id)
      }

      try {
        const res = await postRequest(endpoint, formData)
        if (res.status === 1) {
          toast.success(res.message)
          router.push("/dashboard/premium-listing")
        } else {
          toast.error(res.message || "Error occurred")
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Error occurred")
      }
    },
  })

  const fetchInitialData = useCallback(async () => {
    try {
      const [listingsRes, citiesRes] = await Promise.all([
        getRequest("get-all-listing"),
        getRequest("get-form-city-list"), // Assuming this endpoint fetches all cities
      ])
      setListingList(listingsRes.data.data || [])
      setCityList(citiesRes.data || [])

      if (id) {
        const res = await getRequest(`get-premium-listing-details/${id}`)
        const data = res.data.Listing_details
        if (data) {
          const selectedType = premimumType.find((item) => item.id === data.premium_type)
          const selectedListing = listingsRes.data.data.find(
            (item) => item.listing_unique_id === data.listing_id.listing_unique_id,
          )

          formik.setFieldValue("listing_id", selectedListing.listing_unique_id || null)
          handlePremiumChange(selectedType.id || null) // This will set addCity and addDate states

          if (data.premium_type !== "super_premium") {
            // Only set city and dates if not super_premium
            const selectedCity = citiesRes.data.find((item) => item.unique_id === data.city_id[0]?.unique_id)
            formik.setFieldValue("city_ids", selectedCity.unique_id || null)
            formik.setFieldValue("starting_date", formatDate(data.start_date))
            formik.setFieldValue("endding_date", formatDate(data.end_date))
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to fetch necessary data.")
    }
  }, [id, formik.setFieldValue]) // Removed handlePremiumChange from dependencies

  const handlePremiumChange = useCallback(
    (selected) => {
      formik.setFieldValue("premium_type", selected)
      if (selected && selected !== "super_premium") {
        setAddCity(true)
        setAddDate(true)
      } else {
        setAddCity(false)
        setAddDate(false)
        formik.setFieldValue("city_ids", null) // Reset to null for combobox
        formik.setFieldValue("starting_date", "")
        formik.setFieldValue("endding_date", "")
      }
    },
    [formik],
  )

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const formatDate = (isoDate) => {
    const date = new Date(isoDate)
    return date.toISOString().split("T")[0]
  }

  return (
    <div>
        <form onSubmit={formik.handleSubmit} noValidate>
          {/* Listing Select */}
          <div className="flex flex-wrap relative w-full pb-3.5">
            <Label
              htmlFor="listing_id"
              className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500"
            >
              Listing
            </Label>
            <div className="relative w-full lg:w-1/2 grow">
              <CustomCombobox
                name="listing_id"
                value={formik.values.listing_id}
                onChange={(option) => formik.setFieldValue("listing_id", option)}
                onBlur={() => formik.setFieldTouched("listing_id", true)}
                valueKey="listing_unique_id" // Assuming this is the unique ID for listings
                labelKey="name"
                options={listingList}
                placeholder="Select Listing"
                id="listing_id"
                className={cn("w-full", formik.touched.listing_id && formik.errors.listing_id && "border-red-500")}
              />
              {formik.touched.listing_id && formik.errors.listing_id && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500">
                  {formik.errors.listing_id}
                </div>
              )}
            </div>
          </div>

          {/* Premium Type */}
          <div className="flex flex-wrap relative w-full pb-3.5">
            <Label
              htmlFor="premium_type"
              className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500"
            >
              Premium Type
            </Label>
            <div className="relative w-full lg:w-1/2 grow">
              <CustomCombobox
                name="premium_type"
                value={formik.values.premium_type}
                onChange={handlePremiumChange}
                onBlur={() => formik.setFieldTouched("premium_type", true)}
                valueKey="id"
                labelKey="name"
                options={premimumType}
                placeholder="Select Type"
                id="premium_type"
                className={cn("w-full", formik.touched.premium_type && formik.errors.premium_type && "border-red-500")}
              />
              {formik.touched.premium_type && formik.errors.premium_type && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500">
                  {formik.errors.premium_type}
                </div>
              )}
            </div>
          </div>

          {/* City */}
          {addCity && (
            <div className="flex flex-wrap relative w-full pb-3.5">
              <Label
                htmlFor="city_ids"
                className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500"
              >
                City
              </Label>
              <div className="relative w-full lg:w-1/2 grow">
                <CustomCombobox
                  name="city_ids"
                  value={formik.values.city_ids}
                  onChange={(option) => formik.setFieldValue("city_ids", option)}
                  onBlur={() => formik.setFieldTouched("city_ids", true)}
                  valueKey="unique_id"
                  labelKey="name"
                  options={cityList}
                  placeholder="Select City"
                  id="city_ids"
                  className={cn("w-full", formik.touched.city_ids && formik.errors.city_ids && "border-red-500")}
                  multiSelect={false} // Ensure it's single select
                />
                {formik.touched.city_ids && formik.errors.city_ids && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500">
                    {formik.errors.city_ids}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          {addDate && (
            <>
            <div className="flex flex-wrap relative w-full pb-3.5">
              <Label
                htmlFor="starting_date"
                className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500"
              >
                Start Date
              </Label>
              <div className="relative w-full lg:w-1/2 grow">            
              <Input
                id="starting_date"
                name="starting_date"
                label="Start Date"
                type="date"
                value={formik.values.starting_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.starting_date ? (formik.errors.starting_date) : undefined}
                className={cn("w-full lg:w-1/2", formik.touched.starting_date && formik.errors.starting_date && "border-red-500")}
              />
              {formik.touched.starting_date && formik.errors.starting_date && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500">
                  {formik.errors.starting_date}
                </div>
              )}
              </div>
            </div>
                        <div className="flex flex-wrap relative w-full pb-3.5">
              <Label
                htmlFor="endding_date"
                className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500"
              >
                End Date
              </Label>
              <div className="relative w-full lg:w-1/2 grow">
              <Input
                id="endding_date"
                name="endding_date"
                label="End Date"
                type="date"
                value={formik.values.endding_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endding_date ? (formik.errors.endding_date) : undefined}
                className={cn("w-full lg:w-1/2", formik.touched.endding_date && formik.errors.endding_date && "border-red-500")}
              />
              {formik.touched.endding_date && formik.errors.endding_date && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500">
                  {formik.errors.endding_date}
                </div>
              )}
              </div>
            </div>
            </>
          )}

          {/* Submit */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit flex items-center gap-2.5 text-xs 2xl:text-base font-normal border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] whitespace-nowrap transition-all duration-200 ease-linear"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
    </div>
  )
}
