"use client"

import { useState, useCallback, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, XCircle } from "lucide-react"
import { apiPost } from "@/lib/api"
import { userPostRequest, userPostRequestWithToken } from "@/service/viewService"

const validationSchema = Yup.object({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone_number: Yup.string().min(10, "Phone number must be at least 10 digits").required("Phone number is required"),
  website: Yup.string().url("Invalid URL").required("Website is required"),
  profile_pic: Yup.mixed().nullable(),
  profile_banner: Yup.mixed().nullable(),
})

export function EditProfileForm({ userData, onSaveSuccess, onCancel }) {
  const [submitLoader, setSubmitLoader] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [profileBannerPreview, setProfileBannerPreview] = useState(null)
  
  const formik = useFormik({
    initialValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      phone_number: userData?.phone_number || "",
      website: userData?.website || "",
      profile_pic: null,
      profile_banner: null,
    },
    validationSchema,
    enableReinitialize: true, // Reinitialize form when userData changes
    onSubmit: async (values) => {
        
      setSubmitLoader(true)
      try {
        const formData = new FormData()
        formData.append("name", values.name)
        formData.append("email", values.email)
        formData.append("phone_number", values.phone_number)
        formData.append("website", values.website || "")

        if (values.profile_pic) {
          formData.append("profile_pic", values.profile_pic)
        }
        if (values.profile_banner) {
          formData.append("profile_banner", values.profile_banner)
        }

        // Replace with your actual API endpoint for updating profile
        const res = await userPostRequestWithToken("update-user-profile-details", formData)

        if (res.status === 1) {
          toast.success(res.message || "Profile updated successfully!")
          onSaveSuccess?.() // Call success callback
        } else {
          toast.error(res.message || "Failed to update profile.")
        }
      } catch (error) {
        console.error("Profile update error:", error)
        toast.error(error.message || "Failed to update profile.")
      } finally {
        setSubmitLoader(false)
      }
    },
  })

  useEffect(() => {
    // Set initial previews if images exist in userData
    if (userData?.profile_pic) {
      setProfilePicturePreview(userData.profile_pic)
    }
    if (userData?.profile_banner) {
      setProfileBannerPreview(userData.profile_banner)
    }
  }, [userData])

  const handleFileChange = useCallback(
    (event, fieldName) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (fieldName === "profile_pic") {
            setProfilePicturePreview(reader.result)
          } else {
            setProfileBannerPreview(reader.result)
          }
        }
        reader.readAsDataURL(file)
        formik.setFieldValue(fieldName, file)
      } else {
        if (fieldName === "profile_pic") {
          setProfilePicturePreview(userData?.profile_pic || null) // Revert to original if available
        } else {
          setProfileBannerPreview(userData?.profile_banner || null) // Revert to original if available
        }
        formik.setFieldValue(fieldName, null)
      }
    },
    [formik, userData],
  )

  const handleRemoveFile = useCallback(
    (fieldName) => {
      if (fieldName === "profile_pic") {
        setProfilePicturePreview(null)
      } else {
        setProfileBannerPreview(null)
      }
      formik.setFieldValue(fieldName, null)
    },
    [formik],
  )

  const handlePhoneChange = useCallback(
    (phoneNumber) => {
      formik.setFieldValue("phone_number", phoneNumber)
    },
    [formik],
  )

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile update</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Picture */}
        <div>
          <Label htmlFor="profile_pic" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Profile Picture
          </Label>
          <label
            htmlFor="profile_pic"
            className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative"
          >
            {profilePicturePreview ? (
              <>
                <img
                  src={profilePicturePreview || "/placeholder.svg"}
                  alt="Profile Picture Preview"
                  className="max-h-full max-w-full object-contain p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveFile("profile_pic")
                  }}
                >
                  <XCircle className="h-4 w-4" />
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
                  <span className="font-semibold">Choose File</span> No file chosen
                </p>
              </div>
            )}
            <input
              id="profile_pic"
              name="profile_pic"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "profile_pic")}
              onBlur={formik.handleBlur}
            />
          </label>
          {formik.touched.profile_pic && formik.errors.profile_pic && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.profile_pic}</div>
          )}
        </div>

        {/* Profile Banner */}
        <div>
          <Label htmlFor="profile_banner" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Profile Banner
          </Label>
          <label
            htmlFor="profile_banner"
            className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative"
          >
            {profileBannerPreview ? (
              <>
                <img
                  src={profileBannerPreview || "/placeholder.svg"}
                  alt="Profile Banner Preview"
                  className="max-h-full max-w-full object-contain p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveFile("profile_banner")
                  }}
                >
                  <XCircle className="h-4 w-4" />
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
                  <span className="font-semibold">Choose File</span> No file chosen
                </p>
              </div>
            )}
            <input
              id="profile_banner"
              name="profile_banner"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "profile_banner")}
              onBlur={formik.handleBlur}
            />
          </label>
          {formik.touched.profile_banner && formik.errors.profile_banner && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.profile_banner}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded-md"
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
          )}
        </div>

        {/* Mobile */}
        <div>
          <Label htmlFor="phone_number" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Mobile
          </Label>
            <Input
            id="phone_number"
            name="phone_number"
            type="text"
            placeholder="Enter your phone number"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded-md"
          />
          {formik.touched.phone_number && formik.errors.phone_number && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.phone_number}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded-md"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
          )}
        </div>

        {/* Website (only visible on desktop or if data exists) */}
        <div>
          <Label htmlFor="website" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
            Website
          </Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="Enter your website URL"
            value={formik.values.website || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded-md"
          />
          {formik.touched.website && formik.errors.website && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.website}</div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={submitLoader || !formik.isValid}
          className={'bg-[#012B72] hover:bg-[#012B72]'}
        >
          {submitLoader ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
