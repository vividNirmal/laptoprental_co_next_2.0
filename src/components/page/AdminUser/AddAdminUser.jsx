"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiPost, apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "../../ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CustomCombobox } from "@/components/common/customcombox";
import { Button } from "@/components/ui/button";

const addValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  confirm_password: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password"), null], "Passwords do not match"),
  role: Yup.string().required("Admin Role is required"),
});

const editValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string().required("Admin Role is required"),
});

const AddAdminUser = ({ adminId }) => {  
  const router = useRouter();
  const [loading, setLoading] = useState(!!adminId);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
  });

  useEffect(() => {
    if (adminId) {
      setLoading(true);
      apiGet(`/user-details/${adminId}`)
        .then((res) => {
          setInitialValues({
            name: res.data.name || "",
            email: res.data.email || "",
            password: "",
            confirm_password: "",
            role: res.data.role ? String(res.data.role) : "",
          });
        })
        .catch(() => {
          toast.error("Failed to fetch admin user details");
        })
        .finally(() => setLoading(false));
    }
  }, [adminId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: adminId ? editValidationSchema : addValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("role", values.role);
        if (adminId) {
          formData.append("user_id", adminId);
          const response = await apiPost("/admin-user-update", formData);
          if (response.status === 1) {
            router.back();
            toast.success(response?.message);
          } else {
            toast.error(response?.message);
          }
        } else {
          formData.append("password", values.password);
          formData.append("confirm_password", values.confirm_password);
          const response = await apiPost("/admin-user-create", formData);
          if (response.status === 1) {
            router.back();
            toast.success(response?.message);
          } else {
            toast.error(response?.message);
            resetForm();
          }
        }
      } catch (error) {
        toast.error(
          error.message ||
            (adminId
              ? "Failed to update admin user"
              : "Failed to create admin user")
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className=" bg-white p-8 rounded shadow">
      {/* <h2 className="text-xl font-bold mb-6">
        {adminId ? "Edit Admin User" : "Add Admin User"}
      </h2> */}
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
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.name}
            </div>
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
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.email}
            </div>
          )}
        </div>
        {!adminId && (
          <>
            <div>
              {/* <label className="block mb-1 font-medium">Password</label> */}
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
              {formik.touched.confirm_password &&
                formik.errors.confirm_password && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.confirm_password}
                  </div>
                )}
            </div>
          </>
        )}
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Admin Role
          </Label>
          <CustomCombobox
            name="role"
            value={formik.values.role}
            onChange={(value) => formik.setFieldValue("role", value)}
            onBlur={() => formik.setFieldTouched("role", true)}
            valueKey="value"
            labelKey="label"
            options={[
              { value: "0", label: "Super Admin" },
              { value: "3", label: "Admin" },
            ]}
            placeholder="Select Role"
            id="role"
            className="w-full"
          />
          {formik.touched.role && formik.errors.role && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.role}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            // className="px-3 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              adminId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              )
            ) : adminId ? (
              "Save"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAdminUser;
