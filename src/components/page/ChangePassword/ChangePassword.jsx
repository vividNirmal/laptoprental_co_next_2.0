"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const validate = (values) => {
  const errors = {};
  if (!values.old_password) errors.old_password = "Old password is required";
  if (!values.password) errors.password = "New password is required";
  else if (values.password.length < 6)
    errors.password = "Password must be at least 6 characters";
  if (!values.confirm_password)
    errors.confirm_password = "Confirm password is required";
  else if (values.confirm_password !== values.password)
    errors.confirm_password = "Passwords do not match";
  return errors;
};

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      old_password: "",
      password: "",
      confirm_password: "",
    },
    validate,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const res = await apiPost("/update-password", values);
        if (res.status === 1) {
          toast.success(res.message);
          resetForm();
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
      setSubmitting(false);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Old Password
          </Label>
          <Input
            name="old_password"
            type="password"
            placeholder="Enter old password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.old_password}
          />
          {formik.touched.old_password && formik.errors.old_password && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.old_password}
            </div>
          )}
        </div>
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            New Password
          </Label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </div>
          )}
        </div>
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirm_password}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formik.touched.confirm_password &&
            formik.errors.confirm_password && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.confirm_password}
              </div>
            )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={formik.isSubmitting} className={'bg-[#012B72] hover:bg-[#012B72]'}>
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
