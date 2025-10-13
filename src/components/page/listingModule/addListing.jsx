"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";
import { Badge } from "@/components/ui/badge";

// Custom validation for comma-separated emails
const emailListSchema = Yup.string().test(
  "is-email-list",
  "Please enter valid comma-separated emails",
  (value) => {
    if (!value) return true;
    const emails = value.split(",").map((email) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email));
  }
);

const validationSchema = Yup.object({
  category_ids: Yup.array()
    .min(1, "At least one category must be selected")
    .required("Category is required"),
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  address: Yup.string().required("Address is required"),
  country_id: Yup.string().required("Country is required"),
  state_id: Yup.string().required("State is required"),
  city_id: Yup.array().required("City is required"),
  area_id: Yup.string().required("Area is required"),
  phone_number: Yup.string().required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  contact_person: Yup.string().required("Contact person is required"),
  second_phone_no: Yup.string().nullable(),
  second_email: emailListSchema.nullable(),
  listing_type: Yup.string().required("Listing Type is required"),
  time_duration: Yup.string().required("Time Duration is required"),
  website: Yup.string().url("Must be a valid URL").nullable(),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required"),
  listing_reviews_count: Yup.number()
    .nullable(),
  listing_avg_rating: Yup.number()
    .nullable().max(5, "Rating Value cannot be more than 5"),
});

export default function AddListingPage({ listingId }) {
  const router = useRouter();
  const params = useParams();

  const id = listingId; // Get ID from URL for edit mode
  const [selectedState, setselectedState] = useState(null);
  let selState;
  const ListingType = [{ name: "Free" }, { name: "Premimum" }];

  const TimeDuration = [
    { name: "Per Half Hour" },
    { name: "Per Hour" },
    { name: "Per Day" },
    { name: "Per Month" },
    { name: "Per Words" },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [coverPreview, setcoverPreview] = useState(null);
  const [listingPreview, setlistingPreview] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [listingTypes, setListingTypes] = useState([]);
  const [timeDurations, setTimeDurations] = useState([]);

  const fetchStates = useCallback(async (countryId) => {
    try {
      const res = await getRequest(
        `get-form-state-list/?country_id=${countryId}`
      );
      setStates(res.data || []);
      return res.data || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
      return [];
    }
  }, []);

  const fetchCities = useCallback(async (stateId) => {
    try {
      selState = stateId;
      const res = await getRequest(`get-form-city-list/?state_id=${stateId}`);
      const cities = [{ unique_id: "Select All", name: "Select All" }, ...res.data];
      setCities(cities || []);
      return cities || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
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

      const res = await getRequest(`get-form-area-list?${queryString}`);
      const areas = [{ unique_id: "Select All", name: "Select All" }, ...res.data];
      setAreas(areas || []);
      return areas || [];
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
      return [];
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      category_ids: [],
      name: "",
      description: "",
      address: "",
      country_id: "",
      state_id: "",
      city_id: [],
      area_id: "",
      phone_number: "",
      email: "",
      contact_person: "",
      second_phone_no: "",
      second_email: "",
      listing_type: "",
      time_duration: "",
      website: "",
      price: "",
      listing_reviews_count: "",
      listing_avg_rating: "",
      cover_image: null,
      listing_image: null,
      video_url: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      //   Object.keys(values).forEach((key) => {
      //     if (key === "category_ids") {
      //       values.category_ids.forEach((catId) => formData.append("category_ids[]", catId))
      //     } else if (key === "cover_image" && values.cover_image) {
      //       formData.append("cover_image", values.cover_image)
      //     } else if (values[key] !== null && values[key] !== undefined) {
      //       formData.append(key, values[key])
      //     }
      //   })
      values.category_ids.forEach((element) => {
        formData.append("category_ids[]", element);
      });

      // Append general fields
      const firstField = [
        "name",
        "address",
        "phone_number",
        "email",
        "contact_person",
        "second_phone_no",
        "website",
        "second_email",
        "price",
        "description",
        "time_duration",
        "listing_type",
        "listing_avg_rating",
        "listing_reviews_count",
      ];

      firstField.forEach((element) => {
        if (values[element]) {
          formData.append(element, values[element]);
        }
      });

      // Append location IDs
      formData.append("country_id", values.country_id);
      formData.append("state_id", values.state_id);

      if (values.city_id?.[0] === "Select All") {
        formData.append("is_city_all_selected", "1");
      } else {
        formData.append("is_city_all_selected", "0");
        values.city_id?.forEach((ele) => {
          formData.append("city_ids[]", ele);
        });
      }

      if (values.area_id === "Select All") {
        formData.append("is_area_all_selected", "1");
      } else {
        formData.append("is_area_all_selected", "0");
        if (values.area_id) {
          formData.append("area_id", values.area_id);
        }
      }

      // Append images
      if (values.listing_image) {
        formData.append("listing_image", values.listing_image);
      }
      if (values.cover_image) {
        formData.append("cover_image", values.cover_image);
      }

      formData.append("video_url", values.video_url || "");

      if (id) {
        formData.append("listing_id", id);
      }

      try {
        const response = await postRequest(
          id ? "update-listing-data" : "store-listing-data",
          formData
        );
        if (response.status === 1) {
          toast.success(response.message || "Listing saved successfully!");
          router.push("/dashboard/manage-listing");
        } else {
          toast.error(response.message || "Failed to save listing.");
        }
      } catch (error) {
        console.error("Failed to save listing:", error);
        toast.error("Failed to save listing.");
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const fetchInitialData = useCallback(async () => {
    try {
      const [categoriesRes, countriesRes] = await Promise.all([
        getRequest("get-admin-all-category-list"),
        getRequest("get-form-country-list"),
      ]);

      setCategoryList(categoriesRes.data.data || []);
      setCountries(countriesRes.data || []);
      setListingTypes(ListingType || []);
      setTimeDurations(TimeDuration || []);

      if (id) {
        const listingDetailsRes = await getRequest(`get-listing-details/${id}`);
        const data = listingDetailsRes.data?.Listing_details;
        const categoriesUniqueIds = new Set(
          data.category_ids.map((element) => element.unique_id)
        );

        if (data) {
          formik.setValues({
            name: data.name,
            address: data.address,
            phone_number: data.phone_number,
            email: data.email,
            second_email: data.second_email,
            contact_person: data.contact_person,
            second_phone_no: data.second_phone_no,
            website: data.website,
            listing_type: data.listing_type,
            price: data.price,
            time_duration: data.time_duration,
            description: data.description,
            listing_reviews_count: data.listing_reviews_count,
            listing_avg_rating: data.listing_avg_rating,
            video_url: data.video_url,
            category_ids: Array.from(categoriesUniqueIds), // Set for validation
          });
          if (data.country_id?.unique_id) {
            formik.setFieldValue("country_id", data.country_id?.unique_id);
            await fetchStates(data.country_id.unique_id);
          }

          if (data.state_id?.unique_id) {
            formik.setFieldValue("state_id", data.state_id?.unique_id);
            await fetchCities(data.state_id.unique_id);
          }

          if (data.is_city_all_selected) {
            formik.setFieldValue("city_id", ["Select All"]);
            await fetchAreas(["Select All"]);
          } else if (data.city_id?.length > 0) {
            const cityIds = data.city_id.map((item) => item.unique_id);
            formik.setFieldValue("city_id", cityIds);
            await fetchAreas(cityIds);
          }

          if (data.is_area_all_selected) {
            formik.setFieldValue("area_id", "Select All");
          } else if (data.area_id?._id) {
            formik.setFieldValue("area_id", data.area_id?._id);
          }
          setlistingPreview(data.listing_image);
          setcoverPreview(data.cover_image);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to fetch necessary data.");
    }
  }, [id, formik.setValues, fetchStates, fetchCities, fetchAreas]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ].includes(file.type);

      if (!isValidSize) {
        toast.error(`File ${file.name} is too large (max 5MB).`);
        return;
      }
      if (!isValidType) {
        toast.error(`File ${file.name} has unsupported format.`);
        return;
      }

      setcoverPreview(null);
      formik.setFieldValue("cover_image", null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setcoverPreview(reader.result);
        formik.setFieldValue("cover_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(() => {
    setcoverPreview(null);
    formik.setFieldValue("cover_image", null);
  }, [formik]);

  const handleFilesListing = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ].includes(file.type);

      if (!isValidSize) {
        toast.error(`File ${file.name} is too large (max 5MB).`);
        return;
      }
      if (!isValidType) {
        toast.error(`File ${file.name} has unsupported format.`);
        return;
      }

      setlistingPreview(null);
      formik.setFieldValue("listing_image", null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setlistingPreview(reader.result);
        formik.setFieldValue("listing_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDropListing = useCallback(
    (event) => {
      event.preventDefault();
      handleFilesListing(event.dataTransfer.files);
    },
    [handleFilesListing]
  );

  const handleRemoveImageListing = useCallback(() => {
    setlistingPreview(null);
    formik.setFieldValue("listing_image", null);
  }, [formik]);

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
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

  const handleCategoryCheckboxChange = useCallback(
    (categoryId, checked) => {
      const currentCategories = new Set(formik.values.category_ids);
      if (categoryId === "SELECT_ALL") {
        if (checked) {
          const allCategoryIds = categoryList.map((cat) => cat.unique_id);
          formik.setFieldValue("category_ids", allCategoryIds);
        } else {
          formik.setFieldValue("category_ids", []);
        }
      } else {
        if (checked) {
          currentCategories.add(categoryId);
        } else {
          currentCategories.delete(categoryId);
        }
        formik.setFieldValue("category_ids", Array.from(currentCategories));
      }
    },
    [formik, categoryList]
  );

  const handleNextStep = (e) => {
    // Add 'e' parameter to capture the event
    if (e) {
      e.preventDefault(); // Prevent the default form submission behavior
    }
    formik.validateForm().then((errors) => {
      const fieldsToValidate =
        currentStep === 1
          ? [
              "category_ids",
              "name",
              "description",
              "address",
              "country_id",
              "state_id",
              "city_id",
              "area_id",
              "phone_number",
              "email",
              "listing_type",
              "time_duration",
              "price",
            ]
          : [];

      const currentStepErrors = fieldsToValidate.some((field) => errors[field]);

      if (currentStepErrors) {
        fieldsToValidate.forEach((field) =>
          formik.setFieldTouched(field, true, true)
        );
        return;
      }
      setCurrentStep((prev) => prev + 1);
    });
  };
  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <>
      {/* Step Indicator */}
      <ul className="flex flex-wrap justify-between px-1 sm:px-2 2xl:px-6 mb-8 2xl:mb-20">
        {/* Step 1 */}
        <li className="flex flex-col items-center w-2/4 relative">
          <span
            className={cn(
              "relative z-10 size-10 2xl:size-14 text-lg flex items-center justify-center mb-1 lg:mb-1.5 font-semibold rounded-full p-5 text-white",
              currentStep >= 1 ? "bg-primary" : "bg-gray-300"
            )}
          >
            1
          </span>
          <span className="relative z-10 text-xs lg:text-base text-gray-600">
            Basic Details
          </span>

          {/* Connecting line from Step 1 to Step 2 */}
          <span
            className={cn(
              "absolute top-2/4 -translate-y-2/4 left-0 h-1 -mt-3 2xl:-mt-2.5 transition-all duration-300",
              currentStep === 2
                ? "bg-primary w-full"
                : "bg-primary w-2/4"
            )}
          ></span>
        </li>

        {/* Step 2 */}
        <li className="flex flex-col items-center w-2/4 relative">
          <span
            className={cn(
              "relative z-10 size-10 2xl:size-14 text-lg flex items-center justify-center mb-1 lg:mb-1.5 font-semibold rounded-full p-5 text-white",
              currentStep >= 2 ? "bg-primary" : "bg-gray-300"
            )}
          >
            2
          </span>
          <span className="relative z-10 text-xs lg:text-base text-gray-600">
            Listing Image
          </span>

          {/* Tail line of Step 2 */}
          <span
            className={cn(
              "absolute top-2/4 -translate-y-2/4 left-0 h-1 -mt-3 2xl:-mt-2.5 transition-all duration-300",
              currentStep === 2 ? "bg-primary w-2/4" : "bg-gray-300 w-0"
            )}
          ></span>
        </li>
      </ul>
      <form onSubmit={formik.handleSubmit} noValidate>
        {currentStep === 1 && (
          <div className="flex flex-wrap gap-2.5 2xl:gap-5 gap-x-4">
            {/* Category Checkboxes */}
            <div className="flex flex-wrap relative w-full pb-3.5">
              <Label htmlFor="category_ids" className="lg:w-auto lg:min-w-60">Category</Label>
              <ul className="flex flex-wrap gap-3 2xl:gap-4 w-full lg:w-2/4 grow list-none p-0">
                <li className="w-auto">
                  <label className="relative flex items-center gap-2 2xl:gap-3">
                    <input
                      type="checkbox"
                      className="absolute top-0 opacity-0 peer"
                      checked={
                        formik.values.category_ids.length ===
                          categoryList.length && categoryList.length > 0
                      }
                      onChange={(e) =>
                        handleCategoryCheckboxChange(
                          "SELECT_ALL",
                          e.target.checked
                        )
                      }
                      disabled={categoryList.length === 0}
                    />
                    <span className="w-4 h-4 border border-solid border-indigo-500 rounded-sm block shrink-0 bg-cover bg-center peer-checked:bg-primary transition-all duration-200 ease-linear flex items-center justify-center">
                      {formik.values.category_ids.length ===
                        categoryList.length &&
                        categoryList.length > 0 && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                    </span>
                    <span className="text-xs 2xl:text-base text-slate-500 peer-checked:text-slate-800 transition-all duration-200 ease-linear">Select All Categories</span>
                  </label>
                </li>
                {(categoryList || []).map((category) => (
                  <li key={category.unique_id} className="w-auto">
                    <label
                      className="relative flex items-center gap-2 2xl:gap-3"
                      htmlFor={category.unique_id}
                    >
                      <input
                        type="checkbox"
                        className="absolute top-0 opacity-0 peer"
                        id={category.unique_id}
                        checked={formik.values.category_ids.includes(
                          category.unique_id
                        )}
                        onChange={(e) =>
                          handleCategoryCheckboxChange(
                            category.unique_id,
                            e.target.checked
                          )
                        }
                      />
                      <span className="w-4 h-4 border border-solid border-[#7367f0] rounded-sm block shrink-0 bg-cover bg-center peer-checked:bg-primary transition-all duration-200 ease-linear flex items-center justify-center">
                        {formik.values.category_ids.includes(
                          category.unique_id
                        ) && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-xs 2xl:text-base text-slate-500 peer-checked:text-slate-800 transition-all duration-200 ease-linear">
                        {category.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {formik.touched.category_ids && formik.errors.category_ids && (
                <div className="w-full text-xs text-red-500 mt-1">
                  {typeof formik.errors.category_ids === "string"
                    ? formik.errors.category_ids
                    : ""}
                </div>
              )}
            </div>
            <div className="w-full flex flex-wrap items-start grow">
              <div className="flex items-center justify-between pt-4 mb-1 w-full lg:w-auto lg:min-w-60 text-xs 2xl:text-base text-slate-500">
                <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  Listing Image
                </span>
              </div>
              <div className="w-2/4 grow">
                {/* <span className="ml-auto mb-1 text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96"></span> */}
                <Badge variant="secondary" className="text-red-500 ml-auto mb-1 block">Please upload your images in .webp format for faster loading</Badge>
                <label
                  htmlFor="listing-image-upload"
                  className={cn(
                    `flex flex-col items-center justify-center w-full h-48 2xl:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`,
                    formik.touched.listing_image &&
                      formik.errors.listing_image
                      ? "border-red-500"
                      : "border-gray-300"
                  )}
                  onDrop={handleImageDropListing}
                  onDragOver={handleImageDragOver}
                >
                  {listingPreview ? (
                    <div className="relative group w-full h-full flex items-center justify-center p-2">
                      <img
                        src={listingPreview || "/placeholder.svg"}
                        alt={`Listing Preview`}
                        className="max-w-full max-h-full object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImageListing}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                  )}
                  <input
                    id="listing-image-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFilesListing(e.target.files)}
                    onBlur={formik.handleBlur}
                    name="listing_image"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  />
                </label>
                {formik.touched.listing_image &&
                  formik.errors.listing_image && (
                    <div className="text-red-500 text-xs mt-1">
                      {typeof formik.errors.listing_image === "string"
                        ? formik.errors.listing_image
                        : "Invalid image file."}
                    </div>
                  )}
              </div>
            </div>
            {/* Name */}
            <div className="flex flex-wrap items-center relative w-full pb-3.5">
              <Label htmlFor="name" className="w-full lg:w-auto lg:min-w-60">Name</Label>
              <div className="relative w-full lg:w-1/2 grow pb-3.5">
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter Name"
                  className={cn(
                    "w-full grow outline-none border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.name &&
                      formik.errors.name &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.name}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-wrap relative w-full pb-3.5">
              <Label htmlFor="description" className="w-full lg:w-auto lg:min-w-60">Description</Label>
              <div className="relative w-full lg:w-1/2 grow pb-3.5">
                <textarea
                  id="description"
                  placeholder="description..."
                  className={cn(
                    "min-h-20 2xl:min-h-28 text-xs 2xl:text-base w-full outline-none border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.description &&
                      formik.errors.description &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("description")}
                ></textarea>
                {formik.touched.description && formik.errors.description && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.description}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-wrap relative w-full pb-3.5">
              <Label
                htmlFor="address"
                className="w-full lg:w-auto lg:min-w-60"
              >
                Address
              </Label>
              <div className="relative w-full lg:w-1/2 grow pb-3.5">
                <textarea
                  id="address"
                  placeholder="address..."
                  className={cn(
                    "block min-h-20 2xl:min-h-28 outline-none border border-solid border-gray-300 focus:border-[#7367f0] w-full transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.address &&
                      formik.errors.address &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("address")}
                ></textarea>
                {formik.touched.address && formik.errors.address && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.address}
                  </div>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-wrap relative w-full lg:w-5/12 grow pb-3.5">
              <Label
                htmlFor="country_id"
                className="w-full lg:min-w-96"
              >
                Country
              </Label>
              <CustomCombobox
                name="country_id"
                value={formik.values.country_id}
                onChange={handleCountryChange}
                onBlur={() => formik.setFieldTouched("country_id", true)}
                valueKey="unique_id"
                labelKey="name"
                options={countries}
                placeholder="Select Country"
                id="country_id"
                className={cn(
                  "w-full",
                  formik.touched.country_id &&
                    formik.errors.country_id &&
                    "border-red-500"
                )}
              />
              {formik.touched.country_id && formik.errors.country_id && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                  {formik.errors.country_id}
                </div>
              )}
            </div>

            {/* State */}
            <div className="flex flex-wrap relative w-full lg:w-5/12 grow pb-3.5">
              <Label
                htmlFor="state_id"
                className="w-full lg:min-w-96"
              >
                State
              </Label>
              <CustomCombobox
                name="state_id"
                value={formik.values.state_id}
                onChange={handleChangeStates}
                onBlur={() => formik.setFieldTouched("state_id", true)}
                valueKey="unique_id"
                labelKey="name"
                options={states}
                placeholder="Select State"
                id="state_id"
                className={cn(
                  "w-full",
                  formik.touched.state_id &&
                    formik.errors.state_id &&
                    "border-red-500"
                )}
                disabled={states.length === 0}
              />
              {formik.touched.state_id && formik.errors.state_id && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                  {formik.errors.state_id}
                </div>
              )}
            </div>

            {/* City */}
            <div className="flex flex-wrap relative w-full lg:w-5/12 grow pb-3.5">
              <Label htmlFor="city_id" className="w-full lg:min-w-96">City</Label>
              <CustomCombobox
                name="city_id"
                value={formik.values.city_id}
                onChange={handleChangeCities}
                onBlur={() => formik.setFieldTouched("city_id", true)}
                valueKey="unique_id"
                labelKey="name"
                options={cities}
                placeholder="Select City"
                id="city_id"
                className={cn(
                  "w-full",
                  formik.touched.city_id &&
                    formik.errors.city_id &&
                    "border-red-500"
                )}
                disabled={cities.length === 0}
                multiSelect={true}
              />
              {formik.touched.city_id && formik.errors.city_id && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                  {formik.errors.city_id}
                </div>
              )}
            </div>

            {/* Area */}
            <div className="flex flex-wrap relative w-full lg:w-5/12 grow pb-3.5">
              <Label
                htmlFor="area_id"
                className="w-full lg:min-w-96"
              >
                Area
              </Label>
              <CustomCombobox
                name="area_id"
                value={formik.values.area_id}
                onChange={(value) => formik.setFieldValue("area_id", value)}
                onBlur={() => formik.setFieldTouched("area_id", true)}
                valueKey="unique_id"
                labelKey="name"
                options={areas}
                placeholder="Select Area"
                id="area_id"
                className={cn(
                  "w-full",
                  formik.touched.area_id &&
                    formik.errors.area_id &&
                    "border-red-500"
                )}
                disabled={areas.length === 0}
              />
              {formik.touched.area_id && formik.errors.area_id && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                  {formik.errors.area_id}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col w-full lg:w-1/4 grow">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="phone_number"
                  type="number"
                  placeholder="Enter Phone Number"
                  className={cn(
                    "w-full grow outline-none border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.phone_number &&
                      formik.errors.phone_number &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("phone_number")}
                />
                {formik.touched.phone_number &&
                  formik.errors.phone_number && (
                    <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                      {formik.errors.phone_number}
                    </div>
                  )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col w-full lg:w-1/4 grow">
              <Label htmlFor="email">Email</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter Email"
                  className={cn(
                    "w-full grow outline-none border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.email &&
                      formik.errors.email &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="capitalize [@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex flex-col w-full lg:w-1/4 grow">
              <Label htmlFor="contact_person">Contact Person</Label>
              <div className="w-full relative pb-3.5">
                <Input
                  id="contact_person"
                  type="text"
                  placeholder="Enter Contact Person"
                  className={cn(
                    "text-xs 2xl:text-base w-full outline-none border border-solid border-gray-300 focus:border-[#7367f0] transition-all duration-200 ease-linear rounded-lg px-4 py-2",
                    formik.touched.contact_person &&
                      formik.errors.contact_person &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("contact_person")}
                />
                {formik.touched.contact_person &&
                  formik.errors.contact_person && (
                    <div className="capitalize [@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                      {formik.errors.contact_person}
                    </div>
                  )}
              </div>
            </div>

          {/* Phone Number 2 */}
          <div className="flex flex-col w-full lg:w-5/12 grow">
            <Label htmlFor="second_phone_no">Phone Number 2</Label>
            <div className="relative w-full pb-3.5">
              <Input
                id="second_phone_no"
                type="text"
                placeholder="Enter Phone Number 2"
        
                {...formik.getFieldProps("second_phone_no")}
              />
            </div>
          </div>

            {/* Email 2 */}
            <div className="flex flex-col w-full lg:w-5/12 grow">
              <Label htmlFor="second_email">Email 2</Label>
              <div className="relative w-full pb-3.5">
                <Input
                  id="second_email"
                  type="text"
                  placeholder="Enter Email 2"
                  className={cn(
                    formik.touched.second_email &&
                      formik.errors.second_email &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("second_email")}
                />
              </div>
              {formik.touched.second_email && formik.errors.second_email && (
                <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">{formik.errors.second_email}</div>
              )}
            </div>

            {/* Listing Type */}
            <div className="flex flex-col w-full lg:w-5/12 grow">
              <Label htmlFor="listing_type">Listing Type</Label>
              <div className="relative w-full pb-3.5">
                <CustomCombobox
                  name="listing_type"
                  value={formik.values.listing_type}
                  onChange={(value) =>
                    formik.setFieldValue("listing_type", value)
                  }
                  onBlur={() => formik.setFieldTouched("listing_type", true)}
                  valueKey="name"
                  labelKey="name"
                  options={listingTypes}
                  placeholder="Select Listing Type"
                  id="listing_type"
                  className={cn(
                    "w-full",
                    formik.touched.listing_type &&
                      formik.errors.listing_type &&
                      "border-red-500"
                  )}
                />
                {formik.touched.listing_type && formik.errors.listing_type && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.listing_type}
                  </div>
                )}
              </div>
            </div>

            {/* Time Duration */}
            <div className="flex flex-wrap w-full lg:w-5/12 grow">
              <Label htmlFor="time_duration">Time Duration</Label>
              <div className="relative pb-3.5 w-full">
                <CustomCombobox
                  name="time_duration"
                  value={formik.values.time_duration}
                  onChange={(value) =>
                    formik.setFieldValue("time_duration", value)
                  }
                  onBlur={() => formik.setFieldTouched("time_duration", true)}
                  valueKey="name"
                  labelKey="name"
                  options={timeDurations}
                  placeholder="Select Time Duration"
                  id="time_duration"
                  className={cn(
                    "w-full",
                    formik.touched.time_duration &&
                      formik.errors.time_duration &&
                      "border-red-500"
                  )}
                />
                {formik.touched.time_duration &&
                  formik.errors.time_duration && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.time_duration}
                  </div>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="flex flex-col w-full lg:w-5/12 grow">
              <Label htmlFor="website">Website</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="website"
                  type="text"
                  placeholder="Enter Website"
                  className={cn(
                    formik.touched.website &&
                      formik.errors.website &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("website")}
                />
                {formik.touched.website && formik.errors.website && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.website}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-wrap w-full lg:w-5/12 grow">
              <Label htmlFor="price">Price</Label>
              <div className="relative w-full pb-3.5">
                <Input
                  id="price"
                  type="text"
                  placeholder="Enter Price"
                  className={cn(
                    formik.touched.price &&
                      formik.errors.price &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("price")}
                />
                {formik.touched.price && formik.errors.price && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.price}
                  </div>
                )}
              </div>
            </div>

            {/* Listing Reviews Count */}
            <div className="flex flex-col w-full lg:w-5/12 grow">
              <Label htmlFor="listing_reviews_count"> Rating Count</Label>
              <div className="relative w-full pb-3.5">
                <Input
                  id="listing_reviews_count"
                  type="text"
                  placeholder="Enter Listing Reviews count"
                  className={cn(
                    formik.touched.listing_reviews_count &&
                      formik.errors.listing_reviews_count &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("listing_reviews_count")}
                />
                {formik.touched.listing_reviews_count &&
                  formik.errors.listing_reviews_count && (
                  <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                    {formik.errors.listing_reviews_count}
                  </div>
                )}
              </div>
            </div>

            {/* Listing Average Rating Count */}
            <div className="flex flex-wrap w-full lg:w-5/12 grow">
              <Label htmlFor="listing_avg_rating"> Rating Value</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="listing_avg_rating"
                  type="number"
                  placeholder="Enter  Rating Value"
                  className={cn(
                    formik.touched.listing_avg_rating &&
                      formik.errors.listing_avg_rating &&
                      "border-red-500"
                  )}
                  {...formik.getFieldProps("listing_avg_rating")}
                />
                {formik.touched.listing_avg_rating &&
                  formik.errors.listing_avg_rating && (
                    <div className="[@media(max-width:360px)]:text-[10px] text-xs text-red-500 absolute -bottom-1 left-1">
                      {formik.errors.listing_avg_rating}
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-wrap gap-2.5 2xl:gap-5 gap-x-4">
            {/* Listing Image */}
            <div className="w-full flex-grow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">Cover Image</span>
                <span className="text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">Please upload your images in .webp format for faster loading</span>
              </div>
              <label
                htmlFor="cover-image-upload"
                className={cn(
                  `flex flex-col items-center justify-center w-full h-48 2xl:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`,
                  formik.touched.cover_image && formik.errors.cover_image
                    ? "border-red-500"
                    : "border-gray-300"
                )}
                onDrop={handleImageDrop}
                onDragOver={handleImageDragOver}
              >
                {coverPreview ? (
                  <div className="relative group w-full h-full flex items-center justify-center p-2">
                    <img src={coverPreview || "/placeholder.svg"} alt={`Listing Preview`} className="max-w-full max-h-full object-contain border rounded-md" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleRemoveImage}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                )}
                <input id="cover-image-upload" type="file" className="hidden" onChange={(e) => handleFiles(e.target.files)} onBlur={formik.handleBlur} name="cover_image" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                />
              </label>
              {formik.touched.cover_image && formik.errors.cover_image && (
                <div className="text-red-500 text-xs mt-1">
                  {typeof formik.errors.cover_image === "string"
                    ? formik.errors.cover_image
                    : "Invalid image file."}
                </div>
              )}
            </div>

            <div className="flex flex-col w-full lg:w-5/12 grow">
              <Label htmlFor="video_url">Video Url</Label>
              <div className="relative w-full pb-3.5">
                <Input
                  id="video_url"
                  type="text"
                  placeholder="Enter Video URL"
                  className={cn(
                  )}
                  {...formik.getFieldProps("video_url")}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            className={cn(
              "cursor-pointer p-1.5 px-3 transition-all duration-200 ease-linear",
              currentStep === 1 && "hidden"
            )}
            onClick={handlePreviousStep}
          >
            Previous
          </Button>
          {currentStep < 2 ? (
            <Button
              type="button"
              className="cursor-pointer p-1.5 px-3 transition-all duration-200 ease-linear"
              onClick={handleNextStep}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="cursor-pointer p-1.5 px-3 transition-all duration-200 ease-linear"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
