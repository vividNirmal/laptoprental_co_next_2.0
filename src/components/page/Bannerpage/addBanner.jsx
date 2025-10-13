"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, X } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";

// Static options for Banner Type
const STATIC_BANNER_TYPES = [
  { value: "type-1", label: "Standard Banner" },
  { value: "type-2", label: "Premium Banner" },
  { value: "type-3", label: "Video Banner" },
  { value: "type-4", label: "Pop-up Banner" },
];

// Custom validation for comma-separated emails
const emailListSchema = Yup.string().test(
  "is-email-list",
  "Please enter valid comma-separated emails",
  (value) => {
    if (!value) return true; // Allow empty string
    const emails = value.split(",").map((email) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email));
  }
);

const validationSchema = Yup.object({
  banner_type_id: Yup.string().required("Banner Type is required"),
  category_id: Yup.array().required("Category is required"),
  country_id: Yup.string().required("Country is required"),
  state_id: Yup.string().required("State is required"),
  city_id: Yup.array().required("City is required"),
  banner_title: Yup.string().required("Banner Title is required"),
  banner_preview_url: Yup.string().url("Must be a valid URL").nullable(),
  display_period_days: Yup.number().required("Display period is required"),
  banner_email: emailListSchema.required("Banner Email is required"),
  hide_banner_locations: Yup.array().of(Yup.string()).nullable(),
});

export default function AddBannerForm({ id }) {
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = React.useState(null);
  const [bannerType, setBannerType] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);
  const [selectAllCity, setSelectAllcity] = React.useState(false);
  const [selectAllCategory, setSelectAllCategory] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await getRequest("get-admin-all-category-list");
        setCategories(responce.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("Failed to fetch necessary data.");
      }
    };
    fetchData();
    fetchCountries();
    fetchBanner();
  }, []);

  const formik = useFormik({
    initialValues: {
      banner_type_id: "",
      category_id: [],
      country_id: "",
      state_id: "",
      city_id: [],
      banner_title: "",
      banner_preview_url: "",
      banner_image: "",
      display_period_days: 10,
      banner_email: "",
      hide_banner_locations: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("banner_email", values.banner_email);
      formData.append("display_period_in_days", values.display_period_days.toString());
      formData.append("banner_url", values.banner_preview_url || "");
      formData.append("country_id", values.country_id);
      formData.append("banner_type_id", values.banner_type_id);
      formData.append("banner_title", values.banner_title);
      formData.append("state_id", values.state_id);

      values.hide_banner_locations.forEach((city) => {
        formData.append("hide_banner_city_ids[]", city);
      });

      if (selectAllCity) {
        formData.append("select_all_cities", "1");
      } else {
        formData.append("select_all_cities", "0");
        values.city_id.forEach((city) => {
          formData.append("city_ids[]", city);
        });
      }

      if (selectAllCategory) {
        formData.append("select_all_categories", "1");
      } else {
        formData.append("select_all_categories", "0");
        values.category_id.forEach((category) => {
          formData.append("category_ids[]", category);
        });
      }

      if (values.banner_image instanceof File) {
        formData.append("banner_image", values.banner_image);
      }

      try {
        let response;
        if (id) {
          formData.append("banners_id", id);
          response = await postRequest(`update-banner`, formData);
        } else {
          response = await postRequest("store-banner", formData);
        }
        if (response.data) {
          toast.success(response.message || "Banner saved successfully!");
          router.push("/dashboard/banners");
        }
      } catch (error) {
        console.error("Failed to save banner:", error);
        toast.error("Failed to save banner.");
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const fetchBannerDetails = async () => {
      if (!id) return;
      try {
        const response = await getRequest(`get-banners-details/${id}`);
        const data = response.data.BannerTypeDetails;
        
        if (!data) return;
        
        const countryList = await getRequest("get-form-country-list");
        setCountries(countryList.data || []);
        
        const statesList = await getRequest(
          `get-form-state-list/?country_id=${data.country_id}`
        );
        setStates(statesList.data || []);
        
        const citiesList = await getRequest(
          `get-form-city-list/?state_id=${data.state_id}`
        );
        setCities(citiesList.data || []);
        
        formik.setValues({
          banner_type_id: data.banner_type_id || "",
          category_id: data.category_ids || [],
          country_id: data.country_id || "",
          state_id: data.state_id || "",
          city_id: data.city_ids || [],
          banner_title: data.banner_title || "",
          banner_preview_url: data.banner_url || "",
          banner_image: [],
          display_period_days: data.display_period_in_days || 10,
          banner_email: data.banner_email || "",
          hide_banner_locations: data.hide_banner_city_ids || [],
        });
        
        if (data.select_all_categories) {
          setSelectAllCategory(true);
        }
        
        if (data.select_all_cities) {
          setSelectAllcity(true);
        }
        
        if (data.banner_image) {
          setImagePreviews({ src: data.banner_image });
        } else {
          setImagePreviews([]);
        }
      } catch (error) {
        console.error("Failed to fetch banner details:", error);
        toast.error("Failed to fetch banner details.");
      }
    };
    fetchBannerDetails();
  }, [id]);

  // Effect to sync selectAllCategory state with actual selections
  React.useEffect(() => {
    if (categories.length > 0 && formik.values.category_id.length > 0) {
      const allCategoryIds = categories.map((cat) => cat.unique_id);
      const isAllSelected = allCategoryIds.every(id => 
        formik.values.category_id.includes(id)
      );
      setSelectAllCategory(isAllSelected);
    } else {
      setSelectAllCategory(false);
    }
  }, [formik.values.category_id, categories]);

  // Effect to sync selectAllCity state with actual selections
  React.useEffect(() => {
    if (cities.length > 0 && formik.values.city_id.length > 0) {
      const allCityIds = cities.map((city) => city.unique_id);
      const isAllSelected = allCityIds.every(id => 
        formik.values.city_id.includes(id)
      );
      setSelectAllcity(isAllSelected);
    } else {
      setSelectAllcity(false);
    }
  }, [formik.values.city_id, cities]);

  const handleFiles = React.useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const isValidSize = file.size <= 5 * 1024 * 1024;
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

      setImagePreviews(null);
      formik.setFieldValue("banner_image", null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("banner_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = React.useCallback(() => {
    setImagePreviews(null);
    formik.setFieldValue("banner_image", null);
  }, [formik]);

  const handleImageDragOver = React.useCallback((event) => {
    event.preventDefault();
  }, []);

  const fetchBanner = async () => {
    try {
      const res = await getRequest("get-list-banner-type");
      const data = await res.data;
      if (data) setBannerType(data.data);
    } catch (error) {
      console.error("Error fetching banner types:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await getRequest("get-form-country-list");
      const data = await res.data;
      if (data) setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await getRequest(`get-form-state-list/?country_id=${countryId}`);
      const data = await res.data;
      if (data) {
        setStates(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const res = await getRequest(`get-form-city-list/?state_id=${stateId}`);
      const data = await res.data;
      if (data) {
        setCities(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleCountryChange = (value) => {
    formik.setFieldValue("country_id", value);
    formik.setFieldValue("state_id", "");
    formik.setFieldValue("city_id", []);
    setStates([]);
    setCities([]);
    setSelectAllcity(false);
    
    const matchedCountry = countries.find((country) => country.unique_id == value);
    if (matchedCountry) {
      fetchStates(matchedCountry.unique_id);
    }
  };

  const handleChangeStates = (value) => {
    formik.setFieldValue("state_id", value);
    formik.setFieldValue("city_id", []);
    setCities([]);
    setSelectAllcity(false);
    
    const matchedState = states?.find((state) => state.unique_id == value);
    if (matchedState) {
      fetchCities(matchedState.unique_id);
    }
  };

  const categoryOptionsWithSelectAll = React.useMemo(() => {
    return [
      {
        unique_id: "SELECT_ALL",
        _id: "Select All",
        name: "Select All",
        disabled: categories.length === 0,
      },
      ...categories,
    ];
  }, [categories]);

  const handleCategoryChange = React.useCallback(
    (selectedValue) => {
      if (Array.isArray(selectedValue)) {
        if (selectedValue.includes("SELECT_ALL")) {
          const allCategoryIds = categories.map((cat) => cat.unique_id);
          
          if (selectAllCategory) {
            // If currently all selected, deselect all
            formik.setFieldValue("category_id", []);
            setSelectAllCategory(false);
          } else {
            // If not all selected, select all
            formik.setFieldValue("category_id", allCategoryIds);
            setSelectAllCategory(true);
          }
        } else {
          // Handle individual selections
          formik.setFieldValue("category_id", selectedValue);
          
          // Check if all categories are now selected
          const allCategoryIds = categories.map((cat) => cat.unique_id);
          const isAllSelected = allCategoryIds.every(id => 
            selectedValue.includes(id)
          );
          setSelectAllCategory(isAllSelected);
        }
      } else {
        console.warn("Unexpected single select for category_id:", selectedValue);
      }
    },
    [categories, formik, selectAllCategory]
  );

  const cityOptionsWithSelectAll = React.useMemo(() => {
    return [
      {
        unique_id: "SELECT_ALL",
        _id: "Select All",
        name: "Select All",
        disabled: cities.length === 0,
      },
      ...cities,
    ];
  }, [cities]);

  const handleCityChange = React.useCallback(
    (selectedValue) => {
      
      if (Array.isArray(selectedValue)) {
        if (selectedValue.includes("SELECT_ALL")) {
          const allCityIds = cities.map((city) => city.unique_id);
          
          if (selectAllCity) {
            // If currently all selected, deselect all
            formik.setFieldValue("city_id", []);
            setSelectAllcity(false);
          } else {
            // If not all selected, select all
            formik.setFieldValue("city_id", allCityIds);
            setSelectAllcity(true);
          }
        } else {
          // Handle individual selections
          formik.setFieldValue("city_id", selectedValue);
          
          // Check if all cities are now selected
          const allCityIds = cities.map((city) => city.unique_id);
          const isAllSelected = allCityIds.every(id => 
            selectedValue.includes(id)
          );
          setSelectAllcity(isAllSelected);
        }
      } else {
        console.warn("Unexpected single select for city_id:", selectedValue);
      }
    },
    [cities, formik, selectAllCity]
  );

  return (
    <div>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-wrap gap-4 2xl:gap-5">
          {/* Banner Type */}
          <div className="space-y-2 lg:w-[calc(33%-1rem)] w-full flex-grow">
            <Label
              htmlFor="banner_type_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Banner Type
            </Label>
            <CustomCombobox
              name="banner_type_id"
              value={formik.values.banner_type_id}
              onChange={(value) => formik.setFieldValue("banner_type_id", value)}
              onBlur={() => formik.setFieldTouched("banner_type_id", true)}
              valueKey="_id"
              labelKey="banner_title"
              options={bannerType}
              placeholder="Select Banner Type"
              id="banner_type_id"
            />
            {formik.touched.banner_type_id && formik.errors.banner_type_id && (
              <p className="text-xs text-red-500">{formik.errors.banner_type_id}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Please enter banner type title.</p>
          </div>

          {/* Category */}
          <div className="space-y-2 lg:w-[calc(33%-1rem)] w-full flex-grow">
            <Label
              htmlFor="category_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Category {selectAllCategory && <span className="text-xs text-blue-600">(All Selected)</span>}
            </Label>
            <CustomCombobox
              name="category_id"
              value={formik.values.category_id}
              onChange={handleCategoryChange}
              onBlur={() => formik.setFieldTouched("category_id", true)}
              valueKey="unique_id"
              labelKey="name"
              options={categoryOptionsWithSelectAll}
              placeholder="Select Category"
              id="category_id"
              multiSelect={true}
            />
            {formik.touched.category_id && formik.errors.category_id && (
              <p className="text-xs text-red-500">{formik.errors.category_id}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2 lg:w-[calc(33%-1rem)] w-full flex-grow">
            <Label
              htmlFor="country_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
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
            />
            {formik.touched.country_id && formik.errors.country_id && (
              <p className="text-xs text-red-500">{formik.errors.country_id}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2 lg:w-[calc(33%-1rem)] w-full flex-grow">
            <Label
              htmlFor="state_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
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
            />
            {formik.touched.state_id && formik.errors.state_id && (
              <p className="text-xs text-red-500">{formik.errors.state_id}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2 lg:w-[calc(33%-1rem)] w-full flex-grow">
            <Label
              htmlFor="city_id"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              City {selectAllCity && <span className="text-xs text-blue-600">(All Selected)</span>}
            </Label>
            <CustomCombobox
              name="city_id"
              value={formik.values.city_id}
              onChange={handleCityChange}
              onBlur={() => formik.setFieldTouched("city_id", true)}
              valueKey="unique_id"
              labelKey="name"
              options={cityOptionsWithSelectAll}
              placeholder="Select City"
              id="city_id"
              multiSelect={true}
            />
            {formik.touched.city_id && formik.errors.city_id && (
              <p className="text-xs text-red-500">{formik.errors.city_id}</p>
            )}
          </div>

          {/* Banner Title */}
          <div className="lg:w-[calc(50%-1rem)] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_title"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner Title
              </label>
              <Input
                id="banner_title"
                type="text"
                placeholder="Banner Title"
                maxLength={250}
                {...formik.getFieldProps("banner_title")}
                className={
                  formik.touched.banner_title && formik.errors.banner_title ? "border-red-500" : ""
                }
              />
              {formik.touched.banner_title && formik.errors.banner_title && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.banner_title}
                </div>
              )}
            </div>
          </div>

          {/* Banner Preview URL */}
          <div className="lg:w-[calc(50%-1rem)] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_preview_url"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner Preview URL
              </label>
              <Input
                id="banner_preview_url"
                type="url"
                placeholder="Banner Preview URL"
                maxLength={250}
                {...formik.getFieldProps("banner_preview_url")}
                className={
                  formik.touched.banner_preview_url && formik.errors.banner_preview_url
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.banner_preview_url && formik.errors.banner_preview_url && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.banner_preview_url}
                </div>
              )}
            </div>
          </div>

          {/* Banner Image */}
          <div className="w-full flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Banner Image
              </span>
              <span className="text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96">
                Please upload your images in .webp format for faster loading
              </span>
            </div>
            <label
              htmlFor="banner-image-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.banner_image && formik.errors.banner_image
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
            >
              {imagePreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={imagePreviews.src || "/placeholder.svg?height=200&width=300"}
                    alt={`Banner Preview`}
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
              )}
              <input
                id="banner-image-upload"
                type="file"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                onBlur={formik.handleBlur}
                name="banner_image"
              />
            </label>
            {formik.touched.banner_image && formik.errors.banner_image && (
              <div className="text-red-500 text-xs mt-1">
                {typeof formik.errors.banner_image === "string"
                  ? formik.errors.banner_image
                  : "Invalid image file."}
              </div>
            )}
          </div>

          {/* Display period in days */}
          <div className="lg:w-[calc(50%-1rem)] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="display_period_days"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Display period in days
              </label>
              <Input
                id="display_period_days"
                type="number"
                placeholder="10"
                {...formik.getFieldProps("display_period_days")}
                className={
                  formik.touched.display_period_days && formik.errors.display_period_days
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.display_period_days && formik.errors.display_period_days && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.display_period_days}
                </div>
              )}
            </div>
          </div>

          {/* Banner E-mail */}
          <div className="lg:w-[calc(50%-1rem)] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_email"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner E-mail
              </label>
              <Input
                id="banner_email"
                type="text"
                placeholder="Banner E-mail"
                {...formik.getFieldProps("banner_email")}
                className={
                  formik.touched.banner_email && formik.errors.banner_email ? "border-red-500" : ""
                }
              />
              {formik.touched.banner_email && formik.errors.banner_email && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.banner_email}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter user's email. It is used to send statistics to user. Added Multiple email
                separated comma
              </p>
            </div>
          </div>

          {/* Hide Banner Locations */}
          <div className="w-full flex-grow">
            <div className="space-y-2 w-full relative pb-3.5">
              <Label
                htmlFor="hide_banner_locations"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Hide Banner
              </Label>
              <CustomCombobox
                name="hide_banner_locations"
                value={formik.values.hide_banner_locations}
                onChange={(value) => formik.setFieldValue("hide_banner_locations", value)}
                onBlur={() => formik.setFieldTouched("hide_banner_locations", true)}
                valueKey="unique_id"
                labelKey="name"
                options={cities}
                placeholder="Select City"
                id="hide_banner_locations"
                multiSelect={true}
              />
              {formik.touched.hide_banner_locations && formik.errors.hide_banner_locations && (
                <p className="text-xs text-red-500">{formik.errors.hide_banner_locations}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter Comma separated location for hide banners
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="w-full mt-4">
            <Button
              type="submit"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
