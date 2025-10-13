"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { apiGet, apiPost } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Loader2, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import { CustomCombobox } from "@/components/common/customcombox";
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});
import { textEditormodule } from "@/lib/constant";
import { Button } from "@/components/ui/button";

const initialValues = {
  super_admin: "",
  email_for_otp: "",
  contact_email: "",
  quotation_emails: "",
  phone_number: "",
  login_page_content: "",
  website_logo: null,
  mobile_logo: null,
  fav_icon: null,
  pre_loader: null,
  mobile_listing_banner: null,
  desktop_listing_banner: null,
  theme_id: "",
  send_quotation_mail: "yes",
};

const fileFields = [
  { name: "website_logo", label: "Logo" },
  { name: "mobile_logo", label: "Mobile Logo" },
  { name: "fav_icon", label: "Favicon" },
  { name: "pre_loader", label: "Preloader" },
  { name: "mobile_listing_banner", label: "Mobile Listing Banner" },
  { name: "desktop_listing_banner", label: "Desktop Listing Banner" },
];

const validationSchema = Yup.object().shape({
  super_admin: Yup.string()
    .email("Invalid email")
    .required("Main email required"),
  email_for_otp: Yup.string()
    .email("Invalid email")
    .required("Otp email required"),
  contact_email: Yup.string()
    .email("Invalid email")
    .required("Contact email required"),
  quotation_emails: Yup.string().required("Quotation Emails is required"),
  phone_number: Yup.string()
    .required("Phone number required")
    .matches(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number"),
  login_page_content: Yup.string()
    .test(
      "not-empty",
      "Login page content is required",
      (value) => value && value !== "<p><br></p>"
    )
    .required("Login page content is required"),
  mobile_logo: Yup.mixed().test(
    "file-required",
    "Mobile Logo is required",
    (value) =>
      value &&
      (typeof value !== "object" || !(value instanceof File) || value.size > 0)
  ),
});

const Setting = () => {
  const [previews, setPreviews] = useState({});
  const [themeOptions, setThemeOptions] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [fileErrors, setFileErrors] = useState({});  

  const fetchThemes = async () => {
    try {
      const res = await apiGet("/get-theme");
      if (res.status === 1) {
        setThemeOptions(
          res.data.map((theme) => ({
            label: theme.theme_name,
            value: theme._id,
            colors: {
              boxShadow: theme.box_shadow,
              footerBg: theme.footer_background,
              buttonShadow: theme.button_shadow,
              bodyBg: theme.body_background,
            },
          }))
        );
      }
    } catch (e) {
      setThemeOptions([]);
    }
  };

  const fetchSettings = async () => {
    
    try {
      const res = await apiGet("/get-seeting-details");
      if (res.status === 1 && res.data) {
        const data = res.data;
        const previewObj = {};
        fileFields.forEach(({ name }) => {
          if (
            data[name] &&
            typeof data[name] === "string" &&
            data[name].startsWith("http")
          ) {
            previewObj[name] = data[name];
          }
        });
        setPreviews(previewObj);

        setInitialValues({
          super_admin: data.super_admin || "",
          email_for_otp: data.email_for_otp || "",
          contact_email: data.contact_email || "",
          quotation_emails: data.quotation_emails || "",
          phone_number: data.phone_number || "",
          login_page_content: data.login_page_content || "",
          website_logo: data.website_logo || null,
          mobile_logo: data.mobile_logo || null,
          fav_icon: data.fav_icon || null,
          pre_loader: data.pre_loader || null,
          mobile_listing_banner: data.mobile_listing_banner || null,
          desktop_listing_banner: data.desktop_listing_banner || null,
          theme_id: data.theme_id || "",
          category_box_links: data.category_box_links || "",
          sidebar_button_sequence: data.sidebar_button_sequence || "",
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          linkedin: data.linkedin || "",
          quotation_number: data.quotation_number || "",
          whatsapp_key: data.whatsapp_key || "",
          send_whatsapp_message:
            data.send_whatsapp_message === "yes" ? "yes" : "No",
          send_mail_to_premium_listing:
            data.send_mail_to_premium_listing === "yes" ? "yes" : "No",
          home_page_layout_style: data.home_page_layout_style || "",
          send_quotation_mail: data.send_quotation_mail || "yes",
        });
      }
    } catch (e) {
      // handle error
    }
    
  };
  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleFileChange = (e, setFieldValue, name) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "image/x-icon",
      ];
      if (!allowedTypes.includes(file.type)) {
        setFileErrors((prev) => ({
          ...prev,
          [name]:
            "Mobile Logo must be an image (SVG, PNG, JPG, GIF, WEBP, ICO)",
        }));
        setFieldValue(name, null);
        return;
      } else {
        setFileErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
      setFieldValue(name, file);
      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    } else {
      setFieldValue(name, null);
      setPreviews((prev) => ({
        ...prev,
        [name]: null,
      }));
      setFileErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      super_admin: "",
      email_for_otp: "",
      contact_email: "",
      quotation_emails: "",
      phone_number: "",
      login_page_content: "",
      website_logo: null,
      mobile_logo: null,
      fav_icon: null,
      pre_loader: null,
      mobile_listing_banner: null,
      desktop_listing_banner: null,
      theme_id: "",
      category_box_links: "",
      sidebar_button_sequence: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      quotation_number: "",
      whatsapp_key: "",
      send_whatsapp_message: "No",
      send_mail_to_premium_listing: "No",
      home_page_layout_style: "",
      send_quotation_mail: "yes",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (fileFields.some((field) => field.name === key)) {
          const fileValue = values[key];
          if (fileValue instanceof File) {
            formData.append(key, fileValue);
          }
        } else {
          formData.append(key, values[key] || "");
        }
      });
      try {
        const res = await apiPost("/update-setting", formData);
        if (res.status === 1) {
          await fetchSettings();
          toast.success(res.message);
        } else {
          toast.error(res.message || "Failed to update settings.");
        }
      } catch (error) {
        toast.error("Error updating settings:", error.message);
      }
      
      setSubmitting(false);
    },
  });

  async function handleClear() {
    
    try {
      const res = await apiPost("/clear-setting?type=1");
      if (res.status === 1) {
        await fetchSettings();
        toast.success(res.message);
      }
    } catch (error) {
      toast.error("Error clearing settings:", error.message);
    }
    
  }

  return (
    <div className="">

      <div className="flex gap-4 mb-4 justify-end">
        <Button
          variant="destructive"
          type="button"
          onClick={handleClear}
        >
          Clear Data
        </Button>
        <Button variant="destructive">
          Clear Cache
        </Button>
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
        >
          Save
        </Button>
      </div>
      {initialValues && (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Main Email
              </Label>
              <Input
                name="super_admin"
                type="email"
                placeholder="Enter Main Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.super_admin}
              />
              {formik.touched.super_admin && formik.errors.super_admin && (
                <div className="text-red-500 text-xs">
                  {formik.errors.super_admin}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Email For OTP
              </Label>
              <Input
                name="email_for_otp"
                type="email"
                placeholder="Enter OTP Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email_for_otp}
              />
              {formik.touched.email_for_otp && formik.errors.email_for_otp && (
                <div className="text-red-500 text-xs">
                  {formik.errors.email_for_otp}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Contact Email
            </Label>
            <Input
              name="contact_email"
              type="email"
              placeholder="Enter Contact Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.contact_email}
            />
            {formik.touched.contact_email && formik.errors.contact_email && (
              <div className="text-red-500 text-xs">
                {formik.errors.contact_email}
              </div>
            )}
          </div>
          <div>
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Quotation Emails
            </Label>
            <textarea
              name="quotation_emails"
              rows={4}
              placeholder="Enter Quotation Emails"
              className="w-full p-2 border rounded"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.quotation_emails}
            />
            {formik.touched.quotation_emails &&
              formik.errors.quotation_emails && (
                <div className="text-red-500 text-xs">
                  {formik.errors.quotation_emails}
                </div>
              )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {fileFields.map(({ name, label }) => (
              <div className="flex-1 min-w-[220px]" key={name}>
                {/* <label className="block font-medium text-gray-700 mb-2">
                  {label}
                </label> */}
                <Label
                  htmlFor="state"
                  className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                >
                  {label}
                </Label>
                <label
                  htmlFor={name}
                  className={`group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative ${formik.errors[name] && formik.touched[name]
                    ? "border-red-500"
                    : "border-gray-300"
                    }`}
                >
                  {previews[name] ? (
                    <>
                      <img
                        src={previews[name]}
                        alt={label}
                        className="max-h-full max-w-full object-contain p-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        // className="absolute top-2 right-2 cursor-pointer bg-white rounded-full p-1 shadow hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          formik.setFieldValue(name, null);
                          setPreviews((prev) => ({ ...prev, [name]: null }));
                        }}
                        tabIndex={0}
                      // aria-label={`Remove ${label}`}
                      >
                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg> */}

                        <XCircle className="h-2 w-2" />

                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      <p className="mb-2 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG, GIF, WEBP, ICO (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    id={name}
                    name={name}
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e, formik.setFieldValue, name)
                    }
                    onBlur={() =>
                      formik.setFieldValue(name, formik.values[name])
                    }
                  />
                </label>
                {formik.touched[name] && formik.errors[name] && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors[name]}
                  </div>
                )}
                {fileErrors[name] && (
                  <div className="text-red-500 text-xs mt-1">
                    {fileErrors[name]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Desktop Listing Banner
            </Label>
            <div className="">
              <ReactQuill
                className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
                value={formik.values.login_page_content}
                onChange={(val) =>
                  formik.setFieldValue("login_page_content", val)
                }
                modules={textEditormodule.modules}
              />
              {formik.touched.login_page_content &&
                formik.errors.login_page_content && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.login_page_content}
                  </div>
                )}
            </div>
          </div>
          <div>
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Phone Number
            </Label>
            <Input
              name="phone_number"
              type="text"
              placeholder="Enter Phone Number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone_number}
            />
            {formik.touched.phone_number && formik.errors.phone_number && (
              <div className="text-red-500 text-xs">
                {formik.errors.phone_number}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Category Box Links
              </Label>
              <CustomCombobox
                name="category_box_links"
                value={formik.values.category_box_links}
                onChange={(value) => formik.setFieldValue("category_box_links", value)}
                onBlur={() => formik.setFieldTouched("category_box_links", true)}
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "regular", label: "Regular" },
                  { value: "standard", label: "Standard" },
                ]}
                placeholder="Select"
                id="category_box_links"
              />
              {formik.touched.category_box_links &&
                formik.errors.category_box_links && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.category_box_links}
                  </div>
                )}
            </div>
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Set Button Sequence
              </Label>
              <CustomCombobox
                name="sidebar_button_sequence"
                value={formik.values.sidebar_button_sequence}
                onChange={(value) => formik.setFieldValue("sidebar_button_sequence", value)}
                onBlur={() => formik.setFieldTouched("sidebar_button_sequence", true)}
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "Quote Call Chat", label: "Quote Call Chat" },
                  { value: "Quote Call", label: "Quote Call" },
                  { value: "Quote Call Whatsapp", label: "Quote Call Whatsapp" },
                  { value: "Quote Chat", label: "Quote Chat" },
                  { value: "Quote", label: "Quote" },
                ]}
                placeholder="Select"
                id="sidebar_button_sequence"
              />
              {formik.touched.sidebar_button_sequence &&
                formik.errors.sidebar_button_sequence && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.sidebar_button_sequence}
                  </div>
                )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Facebook
              </Label>
              <Input
                name="facebook"
                type="text"
                placeholder="Enter Facebook"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.facebook}
              />
              {formik.touched.facebook && formik.errors.facebook && (
                <div className="text-red-500 text-xs">
                  {formik.errors.facebook}
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Twitter
              </Label>
              <Input
                name="twitter"
                type="text"
                placeholder="Enter Twitter"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.twitter}
              />
              {formik.touched.twitter && formik.errors.twitter && (
                <div className="text-red-500 text-xs">
                  {formik.errors.twitter}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Linkedin
            </Label>
            <Input
              name="linkedin"
              type="text"
              placeholder="Enter Linkedin"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.linkedin}
            />
            {formik.touched.linkedin && formik.errors.linkedin && (
              <div className="text-red-500 text-xs">
                {formik.errors.linkedin}
              </div>
            )}
          </div>
          <div className="mt-8">
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Theme
            </Label>
            <CustomCombobox
              name="theme_id"
              value={formik.values.theme_id}
              onChange={(value) => formik.setFieldValue("theme_id", value)}
              onBlur={() => formik.setFieldTouched("theme_id", true)}
              valueKey="value"
              labelKey="label"
              options={themeOptions}
              placeholder="Select Theme"
              id="theme_id"
            />
          </div>
          {(() => {
            const selectedTheme = themeOptions.find(
              (t) => t.value === formik.values.theme_id
            );
            if (!selectedTheme) return null;
            const colors = selectedTheme.colors;
            return (
              <div className="flex flex-wrap gap-8 mt-6 justify-between">
                <div>
                  <div className="text-gray-500 mb-1">Box Box Shadow</div>
                  <div
                    className="w-24 h-16 rounded-lg"
                    style={{ background: colors.boxShadow }}
                  />
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Footer Background:</div>
                  <div
                    className="w-24 h-16 rounded-lg"
                    style={{ background: colors.footerBg }}
                  />
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Button Box Shadow</div>
                  <div
                    className="w-24 h-16 rounded-lg"
                    style={{ background: colors.buttonShadow }}
                  />
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Body Background:</div>
                  <div
                    className="w-24 h-16 rounded-lg"
                    style={{ background: colors.bodyBg }}
                  />
                </div>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Quotation Number
              </Label>
              <Input
                name="quotation_number"
                type="text"
                placeholder="Enter Quotation Number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.quotation_number}
              />
              {formik.touched.quotation_number &&
                formik.errors.quotation_number && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.quotation_number}
                  </div>
                )}
            </div>
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Whatsapp Message key
              </Label>
              <Input
                name="whatsapp_key"
                type="text"
                placeholder="Enter Whatsapp Message Key"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.whatsapp_key}
              />
              {formik.touched.whatsapp_key && formik.errors.whatsapp_key && (
                <div className="text-red-500 text-xs">
                  {formik.errors.whatsapp_key}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Send Message On User Whatsapp
              </Label>
              <CustomCombobox
                name="send_whatsapp_message"
                value={formik.values.send_whatsapp_message}
                onChange={(value) => formik.setFieldValue("send_whatsapp_message", value)}
                onBlur={() => formik.setFieldTouched("send_whatsapp_message", true)}
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "No", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                placeholder="Select"
                id="send_whatsapp_message"
              />
              {formik.touched.send_whatsapp_message &&
                formik.errors.send_whatsapp_message && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.send_whatsapp_message}
                  </div>
                )}
            </div>
            <div>
              <Label
                htmlFor="state"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Premium Testing Email
              </Label>
              <CustomCombobox
                name="send_mail_to_premium_listing"
                value={formik.values.send_mail_to_premium_listing}
                onChange={(value) => formik.setFieldValue("send_mail_to_premium_listing", value)}
                onBlur={() => formik.setFieldTouched("send_mail_to_premium_listing", true)}
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "No", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                placeholder="Select"
                id="send_mail_to_premium_listing"
              />
              {formik.touched.send_mail_to_premium_listing &&
                formik.errors.send_mail_to_premium_listing && (
                  <div className="text-red-500 text-xs">
                    {formik.errors.send_mail_to_premium_listing}
                  </div>
                )}
            </div>
          </div>
          <div className="mt-4">
            <Label
              htmlFor="state"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Homepage Layout Type
            </Label>
            <CustomCombobox
              name="home_page_layout_style"
              value={formik.values.home_page_layout_style}
              onChange={(value) => formik.setFieldValue("home_page_layout_style", value)}
              onBlur={() => formik.setFieldTouched("home_page_layout_style", true)}
              valueKey="value"
              labelKey="label"
              options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
              placeholder="Select"
              id="home_page_layout_style"
            />
            {formik.touched.home_page_layout_style &&
              formik.errors.home_page_layout_style && (
                <div className="text-red-500 text-xs">
                  {formik.errors.home_page_layout_style}
                </div>
              )}
          </div>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
          >
            Save
          </Button>
        </form>
      )}
    </div>
  );
};

export default Setting;
