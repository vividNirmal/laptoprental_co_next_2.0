"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { CustomCombobox } from "@/components/common/customcombox"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getRequest, postRequest } from "@/service/viewService"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function AddFeaturedListing({id}) {
  const [listingList, setListingList] = useState([])
  const [cityList, setCityList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [position] = useState(
    Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `${i + 1}` })), // Ensure name is string for combobox
  )
  const params = useParams()
  //const id = params.id // Next.js useParams returns string or string[]
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      listing_id: null ,
      position: null,
      city_ids: [],
      category_ids: [],
    },
    validationSchema: Yup.object({
      listing_id: Yup.string().required("Listing is required"),
      position: Yup.mixed().required("Position is required"),
      city_ids: Yup.array().min(1, "At least one city is required"),
      category_ids: Yup.array().min(1, "At least one category is required"),
    }),
    onSubmit: (values) => handleSubmit(values),
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, citiesRes, categoriesRes] = await Promise.all([
          getRequest("get-all-listing"),
          getRequest("get-form-city-list"),
          getRequest("get-admin-all-category-list"),
        ])

        setListingList(listingsRes.data.data)
        setCityList([{ unique_id: "Select All", name: "Select All" }, ...citiesRes.data])
        setCategoryList([{ unique_id: "Select All", name: "Select All" }, ...categoriesRes.data.data])

        if (id) {
          const featuredDetailsRes = await getRequest(`get-featured-details/${id}`)
          const data = featuredDetailsRes.data.featured_listing
          formik.setFieldValue(
            "city_ids",
            data.is_all_city_selected ? ["Select All"] : data.city_id.map((city) => city.unique_id),
          )
          formik.setFieldValue(
            "category_ids",
            data.is_all_category_selected ? ["Select All"] : data.category_ids.map((cat) => cat.unique_id),
          )
          formik.setFieldValue("listing_id", data.listing_id?.listing_unique_id)
          // Find the position object from the 'position' state array
          const selectedPosition = position.find((p) => p.id === data.position)
          formik.setFieldValue("position", selectedPosition.id || null)
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        toast.error("Failed to load data.")
      }
    }

    fetchData()
  }, [id, position]) // Added position to dependency array as it's used in useEffect

  const handleSubmit = async (values) => {
    const formData = new FormData()
    formData.append("listing_id", values.listing_id || "")
    const pos = typeof values.position === "object" && values.position !== null ? values.position.id : values.position
    formData.append("position", String(pos)) // Ensure position is a string

    const hasAllCities = values.city_ids.some((c) => c === "Select All")
    formData.append("is_all_city_selected", hasAllCities ? "1" : "0")
    if (!hasAllCities) {
      values.city_ids.forEach((c) => {
        formData.append("city_ids[]", c)
      })
    }

    const hasAllCats = values.category_ids.some((c) => c === "Select All")
    formData.append("is_all_category_selected", hasAllCats ? "1" : "0")
    if (!hasAllCats) {
      values.category_ids.forEach((c) => {
        formData.append("category_ids[]", c)
      })
    }

    try {
      const res = await postRequest("add-featured-listing", formData)

      toast.success(res.message)
      router.push("/dashboard/featured-listing")
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    }
  }

  return (
  
        <form onSubmit={formik.handleSubmit} className="w-full flex flex-wrap gap-4">
          <div className="w-full xl:w-[45%] grow relative">
            <Label>Category</Label>
            <CustomCombobox
              options={categoryList}
              value={formik.values.category_ids}
              onChange={(val) => formik.setFieldValue("category_ids", val)}
              isMulti={true}
              placeholder="Select Category"
              valueKey="unique_id"
              labelKey="name"
              multiSelect={true}
            />
            {formik.touched.category_ids && formik.errors.category_ids && (
              <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-4 left-1">
                {formik.errors.category_ids}
              </div>
            )}
          </div>
          <div className="w-full xl:w-[45%] grow relative">
            <Label>City</Label>
            <CustomCombobox options={cityList} value={formik.values.city_ids} onChange={(val) => formik.setFieldValue("city_ids", val)} isMulti={true} placeholder="Select City" valueKey="unique_id" labelKey="name" multiSelect={true} />
            {formik.touched.city_ids && formik.errors.city_ids && (
              <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-4 left-1">
                {formik.errors.city_ids}
              </div>
            )}
          </div>
          <div className="w-full xl:w-[45%] grow relative">
            <Label>Listing</Label>
            <CustomCombobox
              options={listingList}
              value={formik.values.listing_id}
              onChange={(val) => formik.setFieldValue("listing_id", val)}
              placeholder="Select Listing"
              valueKey="listing_unique_id"
              labelKey="name"
            />
            {formik.touched.listing_id && formik.errors.listing_id && (
              <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-4 left-1">
                {formik.errors.listing_id}
              </div>
            )}
          </div>
          <div className="w-full xl:w-[45%] grow relative">
            <Label>Position</Label>
            <CustomCombobox
              options={position}
              value={formik.values.position}
              onChange={(val) => formik.setFieldValue("position", val)}
              placeholder="Select Position"
              valueKey="id"
              labelKey="name"
            />
            {formik.touched.position && formik.errors.position && (
              <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-4 left-1">
                {formik.errors.position}
              </div>
            )}
          </div>
          <div className="w-full pt-4">
            <Button type="submit">Save</Button>
          </div>
        </form>
  
  )
}
