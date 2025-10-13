"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { apiPost } from "@/lib/api"
import { userPostRequestWithToken } from "@/service/viewService"

const validationSchema = Yup.object({
  old_password: Yup.string().required("Current password is required"),
  password: Yup.string().min(6, "New password must be at least 6 characters").required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm new password is required"),
})

export function ChangePasswordForm() {
  const [submitLoader, setSubmitLoader] = useState(false)

  const formik = useFormik({
    initialValues: {
      old_password: "",
      password: "",
      confirm_password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitLoader(true)
      try {
        const formData = new FormData()
        formData.append("old_password", values.old_password)
        formData.append("password", values.password)
        formData.append('confirm_password',values.confirm_password);

        // Replace with your actual API endpoint for changing password
        const res = await userPostRequestWithToken('update-user-password', formData)

        if (res.status === 1) {
          toast.success(res.message || "Password changed successfully!")
          resetForm()
        } else {
          toast.error(res.message || "Failed to change password.")
        }
      } catch (error) {
        console.error("Change password error:", error)
        toast.error(error.message || "Failed to change password.")
      } finally {
        setSubmitLoader(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 p-4 bg-white rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
      <div>
        <Label htmlFor="old_password" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">Old Password</Label>
        <Input
          id="old_password"
          name="old_password"
          type="password"
          placeholder="Enter current password"
          value={formik.values.old_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="rounded-md"
        />
        {formik.touched.old_password && formik.errors.old_password && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.old_password}</div>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter new password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="rounded-md"
        />
        {formik.touched.password && formik.errors.password && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_password" className="text-xs 2xl:text-base font-normal text-slate-500 block mb-1">
          Confirm New Password
        </Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          placeholder="Confirm new password"
          value={formik.values.confirm_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="rounded-md"
        />
        {formik.touched.confirm_password && formik.errors.confirm_password && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.confirm_password}</div>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitLoader || !formik.isValid}
        className={'bg-[#012B72] hover:bg-[#012B72]'}
      >
        {submitLoader && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
        Change Password
      </Button>
    </form>
  )
}
