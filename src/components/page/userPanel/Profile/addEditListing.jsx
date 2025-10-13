"use client"

import { TableHeader } from "@/components/ui/table"


import { Table, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useState, useEffect, useRef, useCallback } from "react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CustomCombobox } from "@/components/common/customcombox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ImageUp, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSelector } from "react-redux"
import { userGetRequestWithToken, userPostRequestWithToken } from "@/service/viewService"


const ListingType = [{ name: "Free" }, { name: "Premium" }]
const TimeDuration = [
  { name: "Per Half Hour" },
  { name: "Per Hour" },
  { name: "Per Day" },
  { name: "Per Month" },
  { name: "Per Words" },
]

export function AddEditListingForm({ isOpen, onClose, editId, onSaveSuccess }) {
  const formContainerRef = useRef(null)
  const [formStep, setFormStep] = useState(1)
  const [categoryList, setCategoryList] = useState([])
  const [countryList, setCountryList] = useState([])
  const [stateList, setStateList] = useState([])
  const [cityList, setCityList] = useState([])
  const [areaList, setAreaList] = useState([])
  const [listingImageFile, setListingImageFile] = useState(null)
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [listingImageUrl, setListingImageUrl] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [buttonLoader, setButtonLoader] = useState(false)
  const [selectedStateId, setSelectedStateId] = useState(null)
  const footerdate = useSelector((state) => state.setting.footerdata);
  const categories = footerdate?.category_list || []        
        var selState = "";
  const initialValues = {
    formGroup1: {
      categorys: [],
      name: "",
      listing_image: "",
      cover_image: "",
    },
    formGroup2: {
      address: "",
      country_id: null,
      city_id: null,
      state_id: null,
      area_id: null,
      time_duration: "",
      price: "",
      listing_type: "",
    },
    formGroup3: {
      phone_number: "",
      email: "",
      second_email: "",
      contact_person: "",
      second_phone_no: "",
      website: "",
    },
    formGroup4: {
      description: "",
    },
  }

  const validationSchema = yup.object().shape({
    formGroup1: yup.object().shape({
      categorys: yup.array().min(1, "At least one category must be selected").required("Category is required"),
      name: yup.string().required("Company Name is required").max(250, "Max 250 characters"),
    }),
    formGroup2: yup.object().shape({
      address: yup.string().required("Address is required"),
      country_id: yup.string().nullable().required("Country is required"),
      state_id: yup.string().nullable().required("State is required"),
      city_id: yup.string().nullable().required("City is required"),
      area_id: yup.string().nullable().required("Area is required"),
      time_duration: yup.string().required("Rates Per is required"),
      price: yup.string().required("Rates is required"),
      listing_type: yup.string().required("Listing type is required"),
    }),
    formGroup3: yup.object().shape({
      phone_number: yup.string().required("Phone Number is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      second_email: yup.string().email("Invalid email").nullable(),
      contact_person: yup.string().required("Contact Person is required").max(250, "Max 250 characters"),
      second_phone_no: yup.string().nullable(),
      website: yup.string().url("Invalid URL").nullable(),
    }),
    formGroup4: yup.object().shape({
      description: yup.string().required("Description is required"),
    }),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setButtonLoader(true)
      const formData = new FormData()

      // Append form data
      formData.append("name", values.formGroup1.name)
      values.formGroup1.categorys.forEach((catId) => formData.append("category_ids[]", catId))
      formData.append("address", values.formGroup2.address)

      if (values.formGroup2.country_id) formData.append("country_id", values.formGroup2.country_id)
      if (values.formGroup2.state_id) formData.append("state_id", values.formGroup2.state_id)

      if (values.formGroup2.city_id) {
        if (values.formGroup2.city_id._id === "Select All") {
          formData.append("is_city_all_selected", "1")
        } else {
          formData.append("is_city_all_selected", "0")
          formData.append("city_ids[]", values.formGroup2.city_id)
        }
      }

      if (values.formGroup2.area_id) {
        if (values.formGroup2.area_id === "Select All") {
          formData.append("is_area_all_selected", "1")
        } else {
          formData.append("is_area_all_selected", "0")
          formData.append("area_id", values.formGroup2.area_id)
        }
      }

      formData.append("time_duration", values.formGroup2.time_duration)
      formData.append("price", values.formGroup2.price)
      formData.append("listing_type", values.formGroup2.listing_type)

      if (values.formGroup3.phone_number) formData.append("phone_number", values.formGroup3.phone_number)
      if (values.formGroup3.email) formData.append("email", values.formGroup3.email)
      if (values.formGroup3.second_email) formData.append("second_email", values.formGroup3.second_email)
      if (values.formGroup3.contact_person) formData.append("contact_person", values.formGroup3.contact_person)
      if (values.formGroup3.second_phone_no)
        formData.append("second_phone_no", values.formGroup3.second_phone_no)
      if (values.formGroup3.website) formData.append("website", values.formGroup3.website)
      formData.append("description", values.formGroup4.description)

      // Append image files
      if (listingImageFile) {
        formData.append("listing_image", listingImageFile)
      }
      if (coverImageFile) {
        formData.append("cover_image", coverImageFile)
      }

      try {
        if (editId) {
          formData.append("listing_id", editId)
           const res = await userPostRequestWithToken('user-update-listing-data', formData);
          if(res.status == 1){
          toast.success(res.message || "Listing added successfully!")
          }else{
            toast.error(res.message)
          }
        } else {
          const res = await userPostRequestWithToken('user-store-listing-data', formData);
          if(res.status == 1){
          toast.success(res.message || "Listing added successfully!")
          }else{
            toast.error(res.message)
          }
        }
        onSaveSuccess()
        handleClose()
      } catch (error) {
        toast.error(error.message || "An error occurred. Please try again.")
      } finally {
        setButtonLoader(false)
      }
    },
  })

  const handleClose = useCallback(() => {
    setFormStep(1)
    formik.resetForm()
    setSelectedCategories(new Set())
    setListingImageFile(null)
    setCoverImageFile(null)
    setListingImageUrl(null)
    setCoverImageUrl(null)
    setSelectedStateId(null)
    onClose()
  }, [formik, onClose])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        

        setCategoryList(categories)
        
        const countriesRes = await userGetRequestWithToken('get-form-country-list')
        setCountryList(countriesRes.data)
      } catch (error) {
        toast.error("Failed to load initial data.")
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (isOpen && editId) {
      const fetchListingData = async () => {
        try {
          const res = await userGetRequestWithToken(`get-user-listing-details/${editId}`)
          const data = res.data.Listing_details

          // Set categories
          setSelectedCategories(new Set(data.category_ids.map((item) => item.unique_id)))
          // Set images
          setListingImageUrl(data.listing_image)
          setCoverImageUrl(data.cover_image)
                           
          // Patch form values
          formik.setValues({
            formGroup1: {
              categorys: data.category_ids.map((item) => item.unique_id),
              name: data.name,
              listing_image: data.listing_image,
              cover_image: data.cover_image,
            },
            formGroup2: {
              address: data.address,
              // country_id: data.country_id?._id,
              // state_id: data.state_id?._id,
              // city_id: data.is_city_all_selected ? "Select All" : data.city_id[0] || null,
              // area_id: data.area_id,
              time_duration: data.time_duration,
              price: data.price,
              listing_type: data.listing_type,
            },
            formGroup3: {
              phone_number: data.phone_number,
              email: data.email,
              second_email: data.second_email,
              contact_person: data.contact_person,
              second_phone_no: data.second_phone_no,
              website: data.website,
            },
            formGroup4: {
              description: data.description,
            },
          })
                    if (data.country_id?._id) {
            formik.setFieldValue("formGroup2.country_id", data.country_id?.unique_id);
            await fetchStates(data.country_id.unique_id);
          }

          if (data.state_id?._id) {
            formik.setFieldValue("formGroup2.state_id", data.state_id?.unique_id);
            await fetchCities(data.state_id.unique_id);
          }

          if (data.is_city_all_selected) {
            
            formik.setFieldValue("formGroup2.city_id", ["Select All"]);
            await fetchAreas(["Select All"]);
          } else if (data.city_id?.length > 0) {
            
            const cityIds = data.city_id.map((item) => item.unique_id);
            formik.setFieldValue("formGroup2.city_id", cityIds[0]);
            await fetchAreas(cityIds);
          }

          if (data.is_area_all_selected) {
            formik.setFieldValue("formGroup2.area_id", "Select All");
          } else if (data.area_id?.unique_id) {
            formik.setFieldValue("formGroup2.area_id", data.area_id?.unique_id);
          }
        } catch (error) {
          toast.error("Failed to load listing details.")
          handleClose()
        }
      }
      fetchListingData()
    }
  }, [isOpen, editId])

  const handleNextStep = async () => {
    const currentFormGroup = formik.values[`formGroup${formStep}` ]
    const currentSchema = validationSchema.fields[`formGroup${formStep}` ]

    try {
      if(currentSchema != undefined){
        await currentSchema.validate(currentFormGroup, { abortEarly: false })
      }  
      if (formStep === 1 && selectedCategories.size === 0) {
        formik.setFieldError("formGroup1.categorys", "At least one category must be selected")
        return
      }

      if (formStep === 5) {
        // This is the preview step, next button will submit
        formik.handleSubmit()
      } else {
        setFormStep((prev) => prev + 1)
        setTimeout(() => {
          formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 0)
      }
    } catch (errors) {
      errors.inner?.forEach((error) => {
        formik.setFieldError(error.path, error.message)
      })
    }
  }

  const handleBackButton = () => {
    setFormStep((prev) => prev - 1)
    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      formik.setFieldValue("formGroup1.categorys", Array.from(newSet))
      formik.setFieldTouched("formGroup1.categorys", true)
      return newSet
    })
  }

  const isAllCategoriesSelected = () => {
    return categoryList.length > 0 && categoryList.every((cat) => selectedCategories.has(cat.unique_id))
  }

  const toggleSelectAllCategories = () => {
    setSelectedCategories((prev) => {
      const newSet = new Set()
      if (!isAllCategoriesSelected()) {
        categoryList.forEach((cat) => newSet.add(cat.unique_id))
      }
      formik.setFieldValue("formGroup1.categorys", Array.from(newSet))
      formik.setFieldTouched("formGroup1.categorys", true)
      return newSet
    })
  }

  const handleImageChange = (event, type) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === "listing") {
          setListingImageFile(file)
          setListingImageUrl(e.target?.result )
        } else {
          setCoverImageFile(file)
          setCoverImageUrl(e.target?.result )
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageDrop = (event, type) => {
    event.preventDefault()
    const file = event.dataTransfer?.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (type === "listing") {
          setListingImageFile(file)
          setListingImageUrl(reader.result )
        } else {
          setCoverImageFile(file)
          setCoverImageUrl(reader.result )
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const onDragOver = (event) => {
    event.preventDefault()
  }

  const handleRemoveImage = (type) => {
    if (type === "listing") {
      setListingImageFile(null)
      setListingImageUrl(null)
    } else {
      setCoverImageFile(null)
      setCoverImageUrl(null)
    }
  }
  const fetchStates = useCallback(async (countryId) => {
    try {
      const res = await userGetRequestWithToken(
        `get-form-state-list/?country_id=${countryId}`
      );
      setStateList(res.data || []);
      return res.data || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      setStateList([]);
      return [];
    }
  }, []);

  const fetchCities = useCallback(async (stateId) => {
    try {
      selState = stateId;
      const res = await userGetRequestWithToken(`get-form-city-list/?state_id=${stateId}`);
      const cities = [{ _id: "Select All", name: "Select All" }, ...res.data];
      setCityList(cities || []);
      return cities || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCityList([]);
      return [];
    }
  }, []);

  const fetchAreas = useCallback(async (cityId) => {
    try {
      if (!cityId || cityId.length === 0) return;
      const isSelectAll = cityId.includes("Select All");
      let queryString = "";      
      if (isSelectAll) {
        queryString = `state_id=${selState}`;        
      } else {
        queryString = cityId.map((id) => `city_id[]=${id}`).join("&");
      }

      const res = await userGetRequestWithToken(`get-form-area-list?${queryString}`);
      const areas = [{ _id: "Select All", name: "Select All" }, ...res.data];
      setAreaList(areas || []);
      return areas || [];
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreaList([]);
      return [];
    }
  }, []);
    const handleCountryChange = useCallback(
    async (value) => {
      formik.setFieldValue("country_id", value);
      formik.setFieldValue("state_id", "");
      formik.setFieldValue("city_id", "");
      formik.setFieldValue("area_id", "");
      setStates([]);
      setCities([]);
      setAreas([]);
      if (value) {
        await fetchStates(value);
      }
    },
    [formik, fetchStates]
  );

  const handleChangeStates = useCallback(
    async (value) => {
      setselectedState(value);
      selState = value;
      formik.setFieldValue("state_id", value);
      formik.setFieldValue("city_id", []);
      formik.setFieldValue("area_id", "");
      setCities([]);
      setAreas([]);
      if (value) {
        await fetchCities(value);
      }
    },
    [formik, fetchCities]
  );

  const handleChangeCities = useCallback(
    async (value) => {      
      formik.setFieldValue("city_id", value);
      formik.setFieldValue("area_id", "");
      setAreas([]);
      if (value) {
        await fetchAreas(value);
      }
    },
    [formik, fetchAreas]
  );
  const handleLocationChange = async (value, type) => {
    
    formik.setFieldValue(`formGroup2.${type}_id`, value)
    formik.setFieldTouched(`formGroup2.${type}_id`, true)

    if (type === "country" && value) {
      const statesRes = await userGetRequestWithToken(`get-form-state-list?country_id=${value}`);
      setStateList(statesRes.data)
      formik.setFieldValue("formGroup2.state_id", null)
      formik.setFieldValue("formGroup2.city_id", null)
      formik.setFieldValue("formGroup2.area_id", null)
      setCityList([])
      setAreaList([])
    } else if (type === "state" && value) {
      setSelectedStateId(value)
      const citiesRes = await userGetRequestWithToken(`get-form-city-list?state_id=${value}`)
      setCityList([{ _id: "Select All", name: "Select All" }, ...citiesRes.data])
      formik.setFieldValue("formGroup2.city_id", null)
      formik.setFieldValue("formGroup2.area_id", null)
      setAreaList([])
    } else if (type === "city" && value) {
      const cityIds = value === "Select All" ? ["Select All"] : [value]
      const isSelectAll = cityIds?.includes('Select All');
    let queryString = '';
    if (isSelectAll) {
      queryString = `state_id=${selectedStateId}`;
    } else {
      queryString = cityIds.map((id) => `city_id[]=${id}`).join('&');
    }
      const areasRes = await userGetRequestWithToken(`get-form-area-list?${queryString}`);
      setAreaList(areasRes.data)
      formik.setFieldValue("formGroup2.area_id", null)
    }
  }

  const getFieldValue = (formGroup, field) => {
    return (formik.values)[formGroup][field]
  }

  const getFieldError = (formGroup, field) => {
    const fieldPath = `${formGroup}.${field}`
    return (formik.touched)[formGroup]?.[field] && (formik.errors)[formGroup]?.[field]
      ? (formik.errors)[formGroup]?.[field]
      : undefined
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="default">Add Listing</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90%] lg:max-w-4xl bg-white rounded-3xl pb-4">
        <DialogHeader>
          <DialogTitle className="text-xl">{editId ? "Edit Listing" : "Add Listing"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 p-4 bg-zinc-50 border border-gray-300 rounded-lg max-h-[70svh] overflow-auto custom-scroll">
          <form onSubmit={formik.handleSubmit}>
            {/* Step 1: Basic Details */}
            {formStep === 1 && (
              <div className="flex flex-wrap gap-3.5 xl:gap-5 mb-5">
                <div className="w-full border-b border-solid border-gray-300 pb-2" ref={formContainerRef}>
                  <h3 className="text-[#012B72] text-base lg:text-lg 2xl:text-2xl font-semibold">Step 1</h3>
                  <p className="text-xs text-gray-500">Basic Details</p>
                </div>
                <div className="w-full">
                  <Label className="relative flex items-center gap-2 2xl:gap-3 mb-3 cursor-pointer">
                    <Checkbox
                      checked={isAllCategoriesSelected()}
                      onCheckedChange={toggleSelectAllCategories}
                      className="w-4 h-4 border border-solid border-[#7367f0] rounded-sm block shrink-0 bg-cover bg-center data-[state=checked]:bg-[#7367f0] data-[state=checked]:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iI2ZmZmZmZiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtNC41IDEyLjc1IDYgNiA5LTEzLjUgeCIgLz4KPC9zdmc+Cg==')] transition-all duration-200 ease-linear"
                    />
                    <span className="text-xs 2xl:text-base font-normal text-gray-700 w-full block peer-checked:text-slate-800 transition-all duration-200 ease-linear">
                      Select All Categories
                    </span>
                  </Label>
                  <ul className="flex flex-wrap gap-1.5 [&>li]:w-full [&>li]:sm:w-5/12 [&>li]:md:w-1/4 [&>li]:md:max-w-[32%] [&>li]:grow">
                    {categoryList.map((item) => (
                      <li key={item.unique_id} className="w-auto">
                        <Label
                          htmlFor={item.unique_id}
                          className="relative flex items-center gap-2 2xl:gap-3 cursor-pointer"
                        >
                          <Checkbox
                            id={item.unique_id}
                            checked={selectedCategories.has(item.unique_id)}
                            onCheckedChange={() => handleCategoryChange(item.unique_id)}
                            className="w-4 h-4 border border-solid border-[#7367f0] rounded-sm block shrink-0 bg-cover bg-center data-[state=checked]:bg-[#7367f0] data-[state=checked]:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iI2ZmZmZmZiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtNC41IDEyLjc1IDYgNiA5LTEzLjUgeCIgLz4KPC9zdmc+Cg==')] transition-all duration-200 ease-linear"
                          />
                          <span className="text-xs 2xl:text-base text-slate-500 data-[state=checked]:text-slate-800 transition-all duration-200 ease-linear">
                            {item.name}
                          </span>
                        </Label>
                      </li>
                    ))}
                  </ul>
                  {getFieldError("formGroup1", "categorys") && (
                    <div className="w-full text-xs text-red-500 mt-1">{getFieldError("formGroup1", "categorys")}</div>
                  )}
                </div>
                <div className="w-full">
                  <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    maxLength={250}
                    value={getFieldValue("formGroup1", "name")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup1.name"
                    placeholder="Enter Company Name"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup1", "name") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup1", "name")}</div>
                  )}
                </div>
                <div className="flex flex-wrap relative w-full">
                  <span className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500">
                    Listing Image
                  </span>
                  <div className="w-full grow relative pb-3.5">
                    <label
                      htmlFor="dropzone-file-listing"
                      className="flex flex-col items-center justify-center w-full h-48 2xl:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onDrop={(e) => handleImageDrop(e, "listing")}
                      onDragOver={onDragOver}
                    >
                      {!listingImageUrl ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageUp className="w-10 h-10 text-gray-400" />
                          <p className="mb-2 text-xs text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                      ) : (
                        <img
                          src={listingImageUrl || "/placeholder.svg"}
                          alt="Listing"
                          className="max-w-[65%] w-full h-full object-cover block"
                        />
                      )}
                      <input
                        id="dropzone-file-listing"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "listing")}
                        accept="image/*"
                      />
                    </label>
                    {listingImageUrl && (
                      <div className="bg-black/75 absolute rounded-lg top-0 left-0 w-full h-full flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-all duration-200 ease-linear">
                        <Button
                          type="button"
                          variant="outline"
                          className="border border-solid border-white px-2 py-1 text-white absolute right-2.5 top-2.5 text-xs 2xl:text-xs bg-transparent"
                          onClick={() => handleRemoveImage("listing")}
                        >
                          Remove
                        </Button>
                        <span className="block text-white font-medium text-base">
                          {listingImageFile?.name || "Image"}
                        </span>
                        <span className="block w-14 h-1 bg-gray-400 my-1.5"></span>
                        <span className="block text-gray-400 font-medium text-base">
                          Drag and drop or click to replace
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap relative w-full">
                  <span className="mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500">
                    Cover Image
                  </span>
                  <div className="w-full grow relative pb-3.5">
                    <label
                      htmlFor="dropzone-file-cover"
                      className="flex flex-col items-center justify-center w-full h-48 2xl:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onDrop={(e) => handleImageDrop(e, "cover")}
                      onDragOver={onDragOver}
                    >
                      {!coverImageUrl ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageUp className="w-10 h-10 text-gray-400" />
                          <p className="mb-2 text-xs text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                      ) : (
                        <img
                          src={coverImageUrl || "/placeholder.svg"}
                          alt="Cover"
                          className="max-w-[65%] w-full h-full object-cover block"
                        />
                      )}
                      <input
                        id="dropzone-file-cover"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "cover")}
                        accept="image/*"
                      />
                    </label>
                    {coverImageUrl && (
                      <div className="bg-black/75 absolute rounded-lg top-0 left-0 w-full h-full flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-all duration-200 ease-linear">
                        <Button
                          type="button"
                          variant="outline"
                          className="border border-solid border-white px-2 py-1 text-white absolute right-2.5 top-2.5 text-xs 2xl:text-xs bg-transparent"
                          onClick={() => handleRemoveImage("cover")}
                        >
                          Remove
                        </Button>
                        <span className="block text-white font-medium text-base">
                          {coverImageFile?.name || "Image"}
                        </span>
                        <span className="block w-14 h-1 bg-gray-400 my-1.5"></span>
                        <span className="block text-gray-400 font-medium text-base">
                          Drag and drop or click to replace
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Details */}
            {formStep === 2 && (
              <div className="flex flex-wrap gap-3.5 xl:gap-5 mb-5">
                <div className="w-full border-b border-solid border-gray-300 pb-2" ref={formContainerRef}>
                  <h3 className="text-[#012B72] text-base lg:text-lg 2xl:text-2xl font-semibold">Step 2</h3>
                  <p className="text-xs text-gray-500">Address Details</p>
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="address"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="formGroup2.address"
                    placeholder="Address"
                    value={getFieldValue("formGroup2", "address")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="text-xs 2xl:text-base bg-white min-h-20 2xl:min-h-28 w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup2", "address") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "address")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="country_id"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    options={countryList}
                    value={getFieldValue("formGroup2", "country_id")}
                    onChange={(val) => handleLocationChange(val, "country")}
                    placeholder="Select Country"
                    valueKey="unique_id"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "country_id") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "country_id")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="state_id"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    State <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    options={stateList}
                    value={getFieldValue("formGroup2", "state_id")}
                    onChange={(val) => handleLocationChange(val, "state")}
                    placeholder="Select State"
                    valueKey="unique_id"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "state_id") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "state_id")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="city_id"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    City <span className="text-red-500">*</span>
                  </Label>
                  
                  <CustomCombobox
                    options={cityList}
                    value={getFieldValue("formGroup2", "city_id")}
                    onChange={(val) => handleLocationChange(val, "city")}
                    placeholder="Select City"
                    valueKey="unique_id"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "city_id") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "city_id")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="area_id"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Area <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    options={areaList}
                    value={getFieldValue("formGroup2", "area_id")}
                    onChange={(val) => handleLocationChange(val, "area")}
                    placeholder="Select Area"
                    valueKey="unique_id"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "area_id") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "area_id")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="time_duration"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Rates Per <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    options={TimeDuration}
                    value=
                      {getFieldValue("formGroup2", "time_duration")}
                    onChange={(val) => formik.setFieldValue("formGroup2.time_duration", val || "")}
                    placeholder="Select Time Duration"
                    valueKey="name"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "time_duration") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "time_duration")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label htmlFor="price" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                    Rates <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="price"
                    maxLength={250}
                    value={getFieldValue("formGroup2", "price")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup2.price"
                    placeholder="Enter Rates"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup2", "price") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "price")}</div>
                  )}
                </div>
                <div className="w-full md:w-1/3 md:grow">
                  <Label
                    htmlFor="listing_type"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Listing Type <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    options={ListingType}
                    value={
                      getFieldValue("formGroup2", "listing_type")
                        
                    }
                    onChange={(val) => formik.setFieldValue("formGroup2.listing_type", val || "")}
                    placeholder="Select Listing Type"
                    valueKey="name"
                    labelKey="name"
                    className="w-full"
                  />
                  {getFieldError("formGroup2", "listing_type") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup2", "listing_type")}</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Contact Details */}
            {formStep === 3 && (
              <div className="flex flex-wrap gap-3.5 xl:gap-5 mb-5">
                <div className="w-full border-b border-solid border-gray-300 pb-2" ref={formContainerRef}>
                  <h3 className="text-[#012B72] text-base lg:text-lg 2xl:text-2xl font-semibold">Step 3</h3>
                  <p className="text-xs text-gray-500">Contact Details</p>
                </div>
                <div className="flex flex-wrap relative w-full">
                  <Label
                    htmlFor="phone_number"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>

                  <Input
                  type="text"
                    id="phone_number"
                    name="formGroup3.phone_number"
                    value={getFieldValue("formGroup3", "phone_number")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Contact"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup3", "phone_number") && (
                    <div className="text-xs text-red-500 mt-1">{getFieldError("formGroup3", "phone_number")}</div>
                  )}
                </div>
                <div className="flex flex-wrap relative w-full">
                  <Label
                    htmlFor="second_phone_no"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Phone Number 2 (optional)
                  </Label>
                  <Input
                  type="text"
                    id="second_phone_no"
                    name="formGroup3.second_phone_no"
                    value={getFieldValue("formGroup3", "second_phone_no")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Contact"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="email" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    maxLength={250}
                    value={getFieldValue("formGroup3", "email")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup3.email"
                    placeholder="Enter Email"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup3", "email") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup3", "email")}</div>
                  )}
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="second_email"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Email 2 (optional)
                  </Label>
                  <Input
                    type="email"
                    id="second_email"
                    maxLength={250}
                    value={getFieldValue("formGroup3", "second_email")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup3.second_email"
                    placeholder="Enter Email 2 (optional)"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup3", "second_email") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup3", "second_email")}</div>
                  )}
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="website"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Website
                  </Label>
                  <Input
                    type="text"
                    id="website"
                    maxLength={250}
                    value={getFieldValue("formGroup3", "website")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup3.website"
                    placeholder="Enter Website"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup3", "website") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup3", "website")}</div>
                  )}
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="contact_person"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="contact_person"
                    maxLength={250}
                    value={getFieldValue("formGroup3", "contact_person")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="formGroup3.contact_person"
                    placeholder="Enter Contact Person"
                    className="text-xs 2xl:text-base bg-white w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup3", "contact_person") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup3", "contact_person")}</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Description */}
            {formStep === 4 && (
              <div className="flex flex-wrap gap-3.5 xl:gap-5 mb-5">
                <div className="w-full border-b border-solid border-gray-300 pb-2" ref={formContainerRef}>
                  <h3 className="text-[#012B72] text-base lg:text-lg 2xl:text-2xl font-semibold">Step 4</h3>
                  <p className="text-xs text-gray-500">Description</p>
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="description"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="formGroup4.description"
                    placeholder="Description"
                    value={getFieldValue("formGroup4", "description")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="text-xs 2xl:text-base bg-white min-h-20 2xl:min-h-28 w-full outline-none border border-solid border-gray-300 focus:border-[#012B72] transition-all duration-200 ease-linear rounded-lg px-3 xl:px-4 py-2"
                  />
                  {getFieldError("formGroup4", "description") && (
                    <div className="text-red-500 text-xs mt-1">{getFieldError("formGroup4", "description")}</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {formStep === 5 && (
              <div className="flex flex-wrap gap-3.5 xl:gap-5 mb-5">
                <div className="w-full border-b border-solid border-gray-300 pb-2" ref={formContainerRef}>
                  <h3 className="text-[#012B72] text-base lg:text-lg 2xl:text-2xl font-semibold">Step 5</h3>
                  <p className="text-xs text-gray-500">Preview</p>
                </div>
                <div className="max-w-full w-full overflow-auto">
                  <Table className="w-full" >
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          colSpan={2}
                          className="py-2 px-2.5 bg-[#012B72] text-left text-xs 2xl:text-base font-medium text-white"
                        >
                          Basic Details
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium"
                        >
                          Listing Name
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium"
                        >
                          {getFieldValue("formGroup1", "name")}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-white">
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          Listing Category
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="break-words py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          {Array.from(selectedCategories)
                            .map((id) => categoryList.find((cat) => cat.unique_id === id)?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="max-w-full w-full overflow-auto mt-4">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          colSpan={2}
                          className="py-2 px-2.5 bg-[#012B72] text-left text-xs 2xl:text-base font-medium text-white"
                        >
                          Address Details
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          Rate
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          {getFieldValue("formGroup2", "price")} ({getFieldValue("formGroup2", "time_duration")})
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-white">
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          Address
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          {getFieldValue("formGroup2", "address")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          City
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2.5 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          {(() => {
  const cityId = getFieldValue("formGroup2", "city_id");
  const city = cityList.find(city => city._id === cityId);
  return city ? city.name : "";
})()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-white">
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          Area
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          {(() => {
  const cityId = getFieldValue("formGroup2", "area_id");
  const city = areaList.find(city => city._id === cityId);
  return city ? city.name : "";
})()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="max-w-full w-full overflow-auto mt-4">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          colSpan={2}
                          className="py-2 px-2 bg-[#012B72] text-left text-xs 2xl:text-base font-medium text-white"
                        >
                          Contact Details
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          Phone Number
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          {getFieldValue("formGroup3", "phone_number")?.number}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-white">
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          Email
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          {getFieldValue("formGroup3", "email")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          Website
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          {getFieldValue("formGroup3", "website")}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-white">
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          Contact Person
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-gray-100"
                        >
                          {getFieldValue("formGroup3", "contact_person")}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="max-w-full w-full overflow-auto mt-4">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          colSpan={2}
                          className="py-2 px-2 bg-[#012B72] text-left text-xs 2xl:text-base font-medium text-white"
                        >
                          Description
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          width="30%"
                          className="whitespace-nowrap py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          Description
                        </TableCell>
                        <TableCell
                          width="70%"
                          className="py-2 px-2 text-left text-xs 2xl:text-base text-gray-700 font-medium bg-white"
                        >
                          {getFieldValue("formGroup4", "description")}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </form>
          <div className="flex items-center justify-end gap-3 mt-6">
            <div className="w-full flex items-center justify-center gap-4">
              <Button
                type="button"
                className={cn(
                  "bg-[#012B72]",
                  formStep === 1 && "hidden",
                )}
                onClick={handleBackButton}
              >
                Previous
              </Button>
              <Button
                type="button"
                className="bg-[#012B72]"
                onClick={handleNextStep}
                disabled={buttonLoader}
              >
                {buttonLoader ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {formStep === 5 ? "Submit" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  )
}
