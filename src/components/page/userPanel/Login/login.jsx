"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2 } from "lucide-react"
import { userGetRequest, userPostRequest } from "@/service/viewService"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { handleAdminuser, handleUser } from "@/redux/userReducer/userRducer"

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
   password: Yup.string()
    .min(6, "Password is invalid")
    .required("Password is required"),
})

const UserLogin = () => {
  const [submitLoader, setSubmitLoader] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values)
    },
  })

  const handleSubmit = async (values) => {
    setSubmitLoader(true)

    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)

      const res = await userPostRequest("/frontend-login", formData)
      if(res.status == 1){
        
        if (res.data?.token) {
            // Store token in localStorage
            localStorage.setItem("usertoken", res.data.token)
            toast.success(res.message || "Login successful!")
            localStorage.setItem("usertoken", res.data.token)
            dispatch(handleUser(res.data.user))

            // Fetch user profile details
            // try {
            //     const profileRes = await userGetRequest("/get-user-profile-details")
            //     if (profileRes.data) {
            //         // You can dispatch to your state management here
            //         // store.dispatch(setUserDetail({ user: profileRes.data }))
            //     }
            // } catch (profileError) {
            // console.error("Failed to fetch user profile:", profileError)
            // }

            // Redirect to home page
            setTimeout(() => {
            router.push("/")
            }, 1000)
        }
      }else{
        toast.error(res.message || "Login failed. Please try again.")
      }
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.")
    } finally {
      setSubmitLoader(false)
    }
  }

  const handleOtpLogin = () => {
    // Handle OTP login logic here
    toast.info("OTP login functionality to be implemented")
  }

  return (
    <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex flex-wrap lg:flex-nowrap">
      {/* Left side - Description */}
      <div className="order-2 lg:order-none w-full lg:w-1/2 px-6 sm:px-10 sm:py-10 xl:p-16 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] text-xs md:[&>p]:text-base [&>p]:text-[#686868] [&>p]:mb-2">
        <h2 className="mb-2 font-bold text-lg text-[#686868]">Login Page Description:</h2>
        <p>The login page serves as the gateway for users to access their accounts on a platform or website. It typically consists of a form where users can input their credentials, such as username or email address, and password. The main purpose of the login page is to authenticate users and grant them access to their personalized content, services, or features.</p>
        <h3 className="mb-2 mt-4 font-bold text-md text-[#686868]">Key Elements:</h3>
        <p><strong>Username or Email Field:</strong> Users are required to enter their username or email address to identify themselves.</p>
        <p><strong>Password Field:</strong> A secure password field where users enter their secret credentials to authenticate their identity.</p>
        <p><strong>Login Button:</strong> A button that users click to submit their credentials and attempt to log in to their accounts.</p>
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

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 xl:p-16">
        <h1 className="mb-2 pb-2 border-b border-[#E5E5E5] font-bold text-lg text-[#686868]">Login</h1>

        <form onSubmit={formik.handleSubmit} className="mt-4">
          <div className="flex flex-col gap-2.5">
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
                <div className="size-8 left-2 top-1/2 -translate-y-1/2 absolute flex items-center justify-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
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
                <div className="size-8 left-2 top-1/2 -translate-y-1/2 absolute flex items-center justify-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
              )}
            </div>

            {/* Links */}
            <div className="relative text-xs font-semibold text-[#686868] flex justify-between pb-4">
              <Link href="/forgot-password" className="hover:underline">
                Forgot Password?
              </Link>
              <Link href="/register" className="hover:underline">
                {"Don't have an account?"}
              </Link>
            </div>

            {/* Buttons */}
            <div className="relative flex flex-col gap-3">
              <Button
                type="submit"
                disabled={submitLoader || !formik.isValid}
                className="text-xs font-semibold text-white bg-[#313E47] hover:bg-[#313E47]/90 w-full p-3 rounded-full hover:scale-103 active:scale-95 active:shadow-none"
              >
                {submitLoader ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login Now"
                )}
              </Button>

              <Button
                type="button"
                onClick={handleOtpLogin}
                className="text-xs font-semibold text-white bg-[#313E47] hover:bg-[#313E47]/90 w-full p-3 rounded-full hover:scale-103 active:scale-95 active:shadow-none"
              >
                Login With OTP
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserLogin
