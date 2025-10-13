import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiPost } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const IpAddressForm = ({ onSuccess,CloseCancel }) => {
  const ipValidationSchema = Yup.object({
    ip_address: Yup.string().required("IP Address is required"),
    ip_holder_name: Yup.string().required("User Name is required"),
    device_type: Yup.string().required("Type is required"),
  });
  const formik = useFormik({
    initialValues: {
      ip_address: "",
      ip_holder_name: "",
      device_type: "",
    },
    validationSchema: ipValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("ip_address", values.ip_holder_name);
        formData.append("ip_holder_name", values.ip_address);
        formData.append("device_type", values.device_type);
        const res = await apiPost("/add-ip", formData);
        if (res.status === 1) {
          if (onSuccess) onSuccess();
          toast.success(res.message);
          resetForm();
        }
      } catch (error) {
        toast.error(res.message);
      } finally {
        setSubmitting(false);
      }
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
            IP holder Name
          </Label>
          <Input
            name="ip_address"
            type="text"
            className="w-full border rounded px-3 py-2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.ip_address}
          />
          {formik.touched.ip_address && formik.errors.ip_address && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.ip_address}
            </div>
          )}
        </div>
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            IP Address
          </Label>
          <Input
            name="ip_holder_name"
            type="text"
            className="w-full border rounded px-3 py-2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.ip_holder_name}
          />
          {formik.touched.ip_holder_name && formik.errors.ip_holder_name && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.ip_holder_name}
            </div>
          )}
        </div>
        <div>
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Device Type
          </Label>
          <CustomCombobox
            name="device_type"
            value={formik.values.device_type}
            onChange={(value) => formik.setFieldValue("device_type", value)}
            onBlur={() => formik.setFieldTouched("device_type", true)}
            valueKey="value"
            labelKey="label"
            options={[
              { value: "all", label: "All" },
              { value: "mobile", label: "Mobile" },
              { value: "desktop", label: "Desktop" },
              { value: "tablet", label: "Tablet" },
            ]}
            placeholder="Select Device Type"
            id="device_type"
            className="w-full"
          />
          {formik.touched.device_type && formik.errors.device_type && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.device_type}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button className="mr-2" onClick={()=>CloseCancel(false)}>Cancel</Button>
          <Button
            type="submit"
            // className="px-3 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IpAddressForm;
