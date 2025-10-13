"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "../../ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  confirm_password: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password"), null], "Passwords do not match"),
});

const AddUser = () => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("confirm_password", values.confirm_password);
        const response = await apiPost("/user-create", formData);
        if (response.status === 1) {
          //   resetForm();
          toast.success(response?.message);
          router.replace('/dashboard/manage-users');
        }
      } catch (error) {
        toast.error(error.message || "Failed to create user");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="state"
          className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
        >
          Name
        </Label>
        <Input
          name="name"
          type="text"
          className="w-full border rounded px-3 py-2"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />
        {formik.touched.name && formik.errors.name && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
        )}
      </div>
      <div>
        <Label
          htmlFor="state"
          className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
        >
          Email
        </Label>
        <Input
          name="email"
          type="email"
          className="w-full border rounded px-3 py-2"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
        )}
      </div>
      <div>
        <Label
          htmlFor="state"
          className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
        >
          Password
        </Label>
        <Input
          name="password"
          type="password"
          className="w-full border rounded px-3 py-2"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
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
        <Input
          name="confirm_password"
          type="password"
          className="w-full border rounded px-3 py-2"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirm_password}
        />
        {formik.touched.confirm_password && formik.errors.confirm_password && (
          <div className="text-red-500 text-xs mt-1">
            {formik.errors.confirm_password}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          // className="px-3 cursor-pointer bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddUser;
