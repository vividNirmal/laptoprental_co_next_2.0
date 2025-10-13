"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";
import { cn } from "@/lib/utils";

const urlMatch = "^(?:([a-z0-9+.-]+):\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$"

const validationSchema = Yup.object({
  banner_title: Yup.string().required("Banner Title is required"),
  banner_size: Yup.string().required("Banner Size is required"),  
  banner_price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Banner Price is required"),
  banner_slots: Yup.number()
    .typeError("Slots must be a number")
    .min(0, "Slots cannot be negative")
    .integer("Slots must be an integer")
    .required("Banner Slots is required"),
  banner_preview_url: Yup.string()
    .matches(new RegExp(urlMatch), "Must be a valid URL")
    .nullable()
    .required("Banner URL is required"),
});
const STATIC_BANNER_SIZES = [
  { value: "120x600", label: "120 x 600", width: 120, height: 600 },
  { value: "120x90", label: "120 x 90", width: 120, height: 90 },
  { value: "125x125", label: "125 x 125", width: 125, height: 125 },
  { value: "160x600", label: "160 x 600", width: 160, height: 600 },
  { value: "234x60", label: "234 x 60", width: 234, height: 60 },
  { value: "258x52", label: "258 x 52", width: 258, height: 52 },
  { value: "300x250", label: "300 x 250", width: 300, height: 250 },
  { value: "468x60", label: "468 x 60", width: 468, height: 60 },
  { value: "728x90", label: "728 x 90", width: 728, height: 90 },
  { value: "custom", label: "Custom" },
];

export default function AddBannerTypeForm({ id }) {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      banner_title: "",
      banner_size: "",
      banner_width: "",
      banner_height: "",
      banner_price: "",
      banner_slots: "",
      banner_preview_url: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("banner_title", values.banner_title);
      formData.append("banner_size", values.banner_size);
      formData.append("banner_price", values.banner_price.toString());
      formData.append("banner_slots", values.banner_slots.toString());
      formData.append("banner_preview_url", values.banner_preview_url || "");

      try {
        let response;
        if (id) {
          formData.append("banner_type_id", id);
          response = await postRequest(`update-banner-type`, formData);
        } else {
          response = await postRequest("store-banner-type", formData);
        }
        if (response.data) {
          toast.success(response.message || "Banner type saved successfully!");
          router.push("/dashboard/banner-types");
        }
      } catch (error) {
        console.error("Failed to save banner type:", error);
        toast.error("Failed to save banner type.");
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const fetchBannerType = async () => {
      if (!id) return;
      try {
        const response = await getRequest(`banner-type-details/${id}`);
        if (response.data.BannerTypeDetails) {
          const data = response.data.BannerTypeDetails;
          formik.setValues({
            banner_title: data.banner_title || "",
            banner_size: data.banner_size || "",
            banner_price: data.banner_price || "",
            banner_slots: data.banner_slots || "",
            banner_preview_url: data.banner_preview_url || "",
          });
          handleBannerSizeChange(data.banner_size)
        }
      } catch (error) {
        console.error("Failed to fetch banner type details:", error);
        toast.error("Failed to fetch banner type details.");
      }
    };
    fetchBannerType();
  }, [id, formik.setValues]);
  const isCustomSizeSelected = formik.values.banner_size === "custom";

  const handleBannerSizeChange = React.useCallback(
    (selectedValue) => {
      formik.setFieldValue("banner_size", selectedValue);
      const selectedOption = STATIC_BANNER_SIZES.find((option) => option.value === selectedValue);

      if (selectedOption && selectedOption.value !== "custom") {
        // If a standard size is selected, populate width and height
        formik.setFieldValue("banner_width", selectedOption.width || "");
        formik.setFieldValue("banner_height", selectedOption.height || "");
      } else {
        // If "Custom" is selected or no option found, clear width and height
        formik.setFieldValue("banner_width", "");
        formik.setFieldValue("banner_height", "");
      }
    },
    [formik] // No need for bannerSizes in dependencies, as it's static
  );

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        {/* Banner Title */}
        <div className="w-full">
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
              <div className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                {formik.errors.banner_title}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Please enter banner type title.</p>
          </div>
        </div>

        {/* Banner Size, Width, Height */}
        <div className="w-full flex flex-wrap gap-4 2xl:gap-5 items-start">
          <div className="lg:w-[calc(33%-1rem)] w-full flex-grow relative">
            <Label
              htmlFor="banner_size"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Banner size
            </Label>
            <CustomCombobox
              name="banner_size"
              value={formik.values.banner_size}
              onChange={handleBannerSizeChange} // Use the new handler
              onBlur={() => formik.setFieldTouched("banner_size", true)}
              valueKey="value"
              labelKey="label"
              options={STATIC_BANNER_SIZES} // Use the static array
              placeholder="Select Banner Size"
              id="banner_size"
            />
            {formik.touched.banner_size && formik.errors.banner_size && (
              <span className="text-red-500 text-xs">
                {formik.errors.banner_size}
              </span>
            )}
          </div>
          <div className="lg:w-[calc(33%-1rem)] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_width"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner Width
              </label>
              <Input
                id="banner_width"
                type="number"
                placeholder="Banner Width"
                {...formik.getFieldProps("banner_width")}
                disabled={!isCustomSizeSelected} // Disable if not custom
                className={cn(
                  formik.touched.banner_width && formik.errors.banner_width ? "border-red-500" : "",
                  !isCustomSizeSelected && "bg-gray-100 cursor-not-allowed" // Add disabled styling
                )}
              />
             
            </div>
          </div>
          <div className="lg:w-[calc(33%-1rem)] w-full flex-grow flex items-center gap-2">
            <span className="text-xl text-gray-500">X</span>
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_height"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner height
              </label>
              <Input
                id="banner_height"
                type="number"
                placeholder="Banner height"
                {...formik.getFieldProps("banner_height")}
                disabled={!isCustomSizeSelected} // Disable if not custom
                className={cn(
                  formik.touched.banner_height && formik.errors.banner_height
                    ? "border-red-500"
                    : "",
                  !isCustomSizeSelected && "bg-gray-100 cursor-not-allowed" // Add disabled styling
                )}
              />
            
            </div>
          </div>
          <p className="text-xs text-gray-500 w-full -mt-2">
            Select banner size. You can choose standard banner size of specify your custom size.
          </p>
        </div>

        {/* Banner Price and Slots */}
        <div className="w-full flex flex-wrap gap-4 2xl:gap-5">
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_price"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner Price
              </label>
              <Input
                id="banner_price"
                type="number"
                placeholder="Banner Price"
                {...formik.getFieldProps("banner_price")}
                className={
                  formik.touched.banner_price && formik.errors.banner_price ? "border-red-500" : ""
                }
              />
              {formik.touched.banner_price && formik.errors.banner_price && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.banner_price}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                USD Enter Price for 10 days period for this banner type.
              </p>
            </div>
          </div>
          <div className="lg:w-[45%] w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="banner_slots"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Banner Slots
              </label>
              <Input
                id="banner_slots"
                type="number"
                placeholder="Banner Slots"
                {...formik.getFieldProps("banner_slots")}
                className={
                  formik.touched.banner_slots && formik.errors.banner_slots ? "border-red-500" : ""
                }
              />
              {formik.touched.banner_slots && formik.errors.banner_slots && (
                <span className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                  {formik.errors.banner_slots}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter Number Of available slots fot this banner type.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
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
              <span className="absolute -bottom-1.5 left-0 text-red-500 text-xs">
                {formik.errors.banner_preview_url}
              </span>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter URL of ant page which contains this banner type. It is used for "Live preview"
              functionality
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="w-full mt-4">
          <Button
            type="submit"
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            disabled={formik.isSubmitting }
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
