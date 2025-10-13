"use client"

import { useState, useEffect, useCallback } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomCombobox } from "@/components/common/customcombox"
import { User, Mail, Lock, Loader2, Phone } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"
import Link from "next/link"

// Phone number validation regex
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone_number: Yup.string().matches(phoneRegex, "Invalid phone number").required("Phone number is required"),
  country_id: Yup.string().nullable().required("Country is required"),
  state_id: Yup.string().nullable().required("State is required"),
  city_id: Yup.string().nullable().required("City is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

const UserRegister = () => {
  const [submitLoader, setSubmitLoader] = useState(false)
  const [countryListing, setCountryListing] = useState([])
  const [stateListing, setStateListing] = useState([])
  const [cityListing, setCityListing] = useState([])
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone_number: "",
      country_id: '' ,
      state_id: '' ,
      city_id: '' ,
      password: "",
      confirm_password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values)
    },
  })

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const res = await apiGet("/get-form-country-list")
      setCountryListing(res.data || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch countries")
    }
  }

  const fetchStates = useCallback(
    async (countryId) => {
      
      try {
        const res = await apiGet(`/get-form-state-list?country_id=${countryId}`)
        setStateListing(res.data || [])
        // Reset state and city when country changes
        formik.setFieldValue("state_id", null)
        formik.setFieldValue("city_id", null)
        setCityListing([])
      } catch (error) {
        toast.error(error.message || "Failed to fetch states")
        setStateListing([])
      }
    },
    [formik],
  )

  const fetchCities = useCallback(
    async (stateId) => {
      try {
        const res = await apiGet(`/get-form-city-list?state_id=${stateId}`)
        setCityListing(res.data || [])
        // Reset city when state changes
        formik.setFieldValue("city_id", null)
      } catch (error) {
        toast.error(error.message || "Failed to fetch cities")
        setCityListing([])
      }
    },
    [formik],
  )

  const handleCountryChange = useCallback(
    (country) => {
      
      formik.setFieldValue("country_id", country)
      if (country) {
        fetchStates(country)
      } else {
        setStateListing([])
        setCityListing([])
        formik.setFieldValue("state_id", null)
        formik.setFieldValue("city_id", null)
      }
    },
    [formik, fetchStates],
  )

  const handleStateChange = useCallback(
    (state) => {
      formik.setFieldValue("state_id", state)
      if (state) {
        fetchCities(state)
      } else {
        setCityListing([])
        formik.setFieldValue("city_id", null)
      }
    },
    [formik, fetchCities],
  )

  const handleCityChange = useCallback(
    (city) => {
      formik.setFieldValue("city_id", city)
    },
    [formik],
  )

  const handleSubmit = async (values) => {
    setSubmitLoader(true)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("phone_number", values.phone_number)
      formData.append("country_id", values.country_id || "")
      formData.append("state_id", values.state_id || "")
      formData.append("city_id", values.city_id || "")
      formData.append("password", values.password)
      formData.append("confirm_password", values.confirm_password)

      const res = await apiPost("/frontend-registration", formData)
      if(res.status == 1){
        toast.success(res.message || "Registration successful!")
        formik.resetForm()
        router.push("/login")
      }else{
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.")
    } finally {
      setSubmitLoader(false)
    }
  }

  return (
    <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex flex-wrap lg:flex-nowrap">
      {/* Left side - Description */}
      <div className="order-2 lg:order-none w-full lg:w-1/2 px-6 sm:px-10 sm:py-10 xl:p-16 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] text-xs md:[&>p]:text-base [&>p]:text-[#686868] [&>p]:mb-2">
        <h2 className="mb-2 font-bold text-lg text-[#686868]">Login Page Description:</h2>
        <p>
          The login page serves as the gateway for users to access their accounts on a platform or website. It typically
          consists of a form where users can input their credentials, such as username or email address, and password.
          The main purpose of the login page is to authenticate users and grant them access to their personalized
          content, services, or features.
        </p>
        <h3 className="mb-2 mt-4 font-bold text-md text-[#686868]">Key Elements:</h3>
        <p>
          <strong>Username or Email Field:</strong> Users are required to enter their username or email address to
          identify themselves.
        </p>
        <p>
          <strong>Password Field:</strong> A secure password field where users enter their secret credentials to
          authenticate their identity.
        </p>
        <p>
          <strong>Login Button:</strong> A button that users click to submit their credentials and attempt to log in to
          their accounts.
        </p>
        <p>
          <strong>Forgot Password Link:</strong> A link that users can click if they forget their password. It typically
          redirects them to a page where they can reset their password using their registered email address.
        </p>
        <p>
          <strong>Sign-Up Link:</strong> A link that directs new users to the sign-up or registration page where they
          can create a new account if they don't have one already.
        </p>
        <p>
          <strong>Additional Messaging:</strong> Optionally, the login page may include additional messaging such as
          security notices, instructions for account recovery, or prompts for two-factor authentication.
        </p>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 xl:p-16">
        <h1 className="mb-2 pb-2 border-b border-[#E5E5E5] font-bold text-lg text-[#686868]">Register</h1>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-4">
          {/* Username Field */}
          <div className="relative">
            <Label htmlFor="name" className="text-slate-500 mb-1 block">
              Username *
            </Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Username"
                maxLength={250}
                className="pl-11 rounded-full bg-white"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="py-1.5 h-10 absolute inset-0 right-auto flex items-center pointer-events-none left-3 text-gray-400">
                <User className="h-4 w-4" />
              </div>
            </div>
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
            )}
          </div>

          {/* Email Field */}
          <div className="relative">
            <Label htmlFor="email" className="text-slate-500 mb-1 block">
              Email *
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                maxLength={250}
                className="pl-11 rounded-full bg-white"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="py-1.5 h-10 absolute top-0 left-0 flex items-center pointer-events-none left-3 text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="w-full">
            <Label htmlFor="phone_number" className="text-slate-500 mb-1 block">
              Phone Number *
            </Label>
            <div className="relative">
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="Enter Contact"
                maxLength={20}
                className="pl-11 rounded-full bg-white"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="py-1.5 h-10 absolute inset-0 right-auto flex items-center pointer-events-none left-3 text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
            </div>
            {formik.touched.phone_number && formik.errors.phone_number && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.phone_number}</div>
            )}
          </div>

          {/* Country Dropdown */}
          <div className="flex flex-wrap relative w-full grow pb-3.5">
            <Label className="text-slate-500 mb-1 block w-full">Country *</Label>
            <CustomCombobox
              options={countryListing}
              value={formik.values.country_id}
              onChange={handleCountryChange}
              placeholder="Select Country"
              valueKey="unique_id"
              labelKey="name"
              className="w-full rounded-full"
            />
            {formik.touched.country_id && formik.errors.country_id && (
              <div className="text-red-500 text-xs absolute -bottom-1 left-1">
                {typeof formik.errors.country_id === "string" ? formik.errors.country_id : "Country is required"}
              </div>
            )}
          </div>

          {/* State Dropdown */}
          <div className="flex flex-wrap relative w-full grow pb-3.5">
            <Label className="text-slate-500 mb-1 block w-full">State *</Label>
            <CustomCombobox
              options={stateListing}
              value={formik.values.state_id}
              onChange={handleStateChange}
              placeholder="Select State"
              valueKey="unique_id"
              labelKey="name"
              className="w-full rounded-full"
            />
            {formik.touched.state_id && formik.errors.state_id && (
              <div className="text-red-500 text-xs absolute -bottom-1 left-1">
                {typeof formik.errors.state_id === "string" ? formik.errors.state_id : "State is required"}
              </div>
            )}
          </div>

          {/* City Dropdown */}
          <div className="flex flex-wrap relative w-full grow pb-3.5">
            <Label className="text-slate-500 mb-1 block w-full">City *</Label>
            <CustomCombobox
              options={cityListing}
              value={formik.values.city_id}
              onChange={handleCityChange}
              placeholder="Select City"
              valueKey="unique_id"
              labelKey="name"
              className="w-full rounded-full"
            />
            {formik.touched.city_id && formik.errors.city_id && (
              <div className="text-red-500 text-xs absolute -bottom-1 left-1">
                {typeof formik.errors.city_id === "string" ? formik.errors.city_id : "City is required"}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <Label htmlFor="password" className="text-slate-500 mb-1 block">
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                maxLength={250}
                className="pl-11 rounded-full bg-white"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="py-1.5 h-10 absolute inset-0 right-auto flex items-center pointer-events-none left-3 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative mb-5">
            <Label htmlFor="confirm_password" className="text-slate-500 mb-1 block">
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm Password"
                maxLength={250}
                className="pl-11 rounded-full bg-white"
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="py-1.5 h-10 absolute inset-0 right-auto flex items-center pointer-events-none left-3 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            {formik.touched.confirm_password && formik.errors.confirm_password && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.confirm_password}</div>
            )}
          </div>

          {/* Back to Login Link */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-[#686868] flex justify-between">
              <Link href="/login" className="hover:underline">
                Back To Login
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <div className="mb-5">
            <Button
              type="submit"
              disabled={submitLoader || !formik.isValid}
              className="mb-8 text-xs font-semibold text-white bg-[#313E47] hover:bg-[#313E47]/90 w-full p-3 rounded-full hover:scale-103 active:scale-95 active:shadow-none"
            >
              {submitLoader ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserRegister
