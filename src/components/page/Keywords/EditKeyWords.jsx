"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const EditKeyWords = () => {
  const { keyId } = useParams();
  const searchParams = useSearchParams();
  const words = searchParams.get("words");  
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      words: words || "",
    },
    validationSchema: Yup.object({
      words: Yup.string().required("Keyword is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("keyword_id", keyId);
        formData.append("words", values.words);
        const res = await apiPost("/update-keyword", formData);
        if (res?.status === 1) {
          // toast.success(res.message);
          toast.success(res?.message);
          router.back();
          setEditModalOpen(false);
          // fetchKeywords()
        }
      } catch (error) {
        // alert("Update failed!");
        toast.error(res.message);
      }
      setSubmitting(false);
    },
  });

  return (
    <div className="w-full p-6 bg-white ">
      {/* <h2 className="mb-4 text-lg font-semibold">Edit Keyword</h2> */}
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <Label
            htmlFor="state"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Keywords
          </Label>
          <Input
            id="words"
            name="words"
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.words}
            placeholder="Enter keyword"
          />
          {formik.touched.words && formik.errors.words ? (
            <div className="text-red-600 text-xs mt-1">
              {formik.errors.words}
            </div>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-6 py-2 rounded-lg bg-[#7B61FF] text-white font-semibold hover:bg-[#6a50e6] transition"
        >
          {formik.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Save"
          )}
        </button>
      </form>
    </div>
  );
};

export default EditKeyWords;
