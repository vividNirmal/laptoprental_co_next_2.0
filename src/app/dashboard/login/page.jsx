"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { loginRequest, postRequest } from "@/service/viewService" // Import specific functions
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import {handleAdminuser} from "@/redux/userReducer/userRducer"
export default function LoginType() {
  const [loginStep, setLoginStep] = useState(1)
  const [loginMethod, setLoginMethod] = useState("otp")
  const [loader, setLoader] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const dispatch = useDispatch()
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, []);
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object().shape({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values, actions) => {
      setLoader(true)
      try {
        const formData = new FormData();
        formData.append("email", values.email);
        const res = await postRequest("check-superadmin-user", formData)
        if (res.status == 1) {
          const detectedMethod = res?.data?.loginMethod || "otp"  // fallback
          setLoginMethod(detectedMethod)
          setEmail(values.email)
          setLoginStep(2)
          
          toast.success(res?.message);
        } else {
          toast.error(res?.message);
          emailFormik.resetForm()
        }
      } catch (error) {

        actions.setFieldError("email", error.message || "Something went wrong")
      } finally {
        setLoader(false)
      }
    },
  })

  const credentialFormik = useFormik({
    enableReinitialize: true,
    initialValues: { credential: "" },
    validationSchema: Yup.object().shape({
      credential: Yup.string().required(loginMethod === "password" ? "Password is required" : "OTP is required"),
    }),
    onSubmit: async (values, actions) => {
      setLoader(true)
      try {
        const payload = {
          email,
          login_method: loginMethod,
          [loginMethod === "otp" ? "otp" : "password"]: values.credential,
        }

        const res = await loginRequest('admin-login', payload);
        if (res.status == 1) {
          toast.success(res?.message);
          dispatch(handleAdminuser(res?.data?.user))
          localStorage.setItem("token", res?.data?.token)
          localStorage.setItem("loginuser", JSON.stringify(res?.data?.user))
          router.push("/dashboard")
        } else {
          toast.error(res?.message);
        }


      } catch (error) {
        actions.setFieldError("credential", error.message || "Login failed")
      } finally {
        setLoader(false)
      }
    },
  })

  const resetForm = () => {
    setLoginStep(1)
    setEmail("")
    emailFormik.resetForm()
  }

  const loginImg = "/assets/login-img.png?height=300&width=300&text=Login+Image"

  return (
    <section className="h-screen p-4 bg-gray-200 flex items-center justify-center">
      <div className="flex flex-wrap justify-center items-center rounded-2xl bg-white shadow-2xl p-6 max-w-5xl w-full m-auto min-h-[414px] relative">
        {loginStep !== 1 && (
          <button
            className="absolute left-4 top-4 cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={resetForm}
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <div className="w-full md:w-5/12 mb-3 md:mb-0 flex justify-center items-center">
          <Image
            src={loginImg || "/placeholder.svg"}
            className="max-w-full h-auto"
            alt="login"
            width={300}
            height={300}
          />
        </div>
        <div className="w-full md:w-5/12 md:px-4">
          <h2 className="text-2xl font-semibold mb-5">
            {loginStep === 1
              ? "Enter your email"
              : loginMethod === "password"
                ? "Login with Password"
                : "Login with OTP"}
          </h2>

          <form onSubmit={emailFormik.handleSubmit}>
            <div className="relative mb-5">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange}
                onBlur={emailFormik.handleBlur}
                disabled={loader}
                error={emailFormik.touched.email && emailFormik.errors.email}
              />
              {emailFormik.touched.email && emailFormik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{emailFormik.errors.email}</p>
              )}
            </div>
            {loginStep === 1 && (<button
              type="submit"
              disabled={loader || emailFormik.isSubmitting}
              className="text-white bg-[#7367f0] border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] cursor-pointer font-medium rounded-md block w-full py-2.5 lg:py-3 p-4 outline-none transition-all duration-200 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loader ? "Please wait..." : "Login"}
            </button>
            )}
          </form>
          {loginStep === 2 && (
            <form onSubmit={credentialFormik.handleSubmit}>
              <div className="relative mb-5">
                <Input
                  type={loginMethod === "password" ? "password" : "text"}
                  name="credential"
                  placeholder={loginMethod === "password" ? "Password" : "OTP"}
                  value={credentialFormik.values.credential}
                  onChange={credentialFormik.handleChange}
                  onBlur={credentialFormik.handleBlur}
                  disabled={loader}
                  error={credentialFormik.touched.credential && credentialFormik.errors.credential}
                />
                {credentialFormik.touched.credential && credentialFormik.errors.credential && (
                  <p className="text-red-500 text-xs mt-1">{credentialFormik.errors.credential}</p>
                )}
              </div>
              {loginMethod === "otp" && (
                <div className="mb-4 text-right">
                  <button
                    type="button"
                    className="cursor-pointer underline text-xs text-[#7367f0] hover:text-[#5e52d1] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => emailFormik.handleSubmit()}
                    disabled={loader}
                  >
                    Resend OTP
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={loader || credentialFormik.isSubmitting}
                className="text-white bg-[#7367f0] border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] cursor-pointer font-medium rounded-md block w-full py-2.5 lg:py-3 p-4 outline-none transition-all duration-200 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loader ? "Logging in..." : "Login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

