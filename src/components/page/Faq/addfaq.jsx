"use client";
import {useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill to ensure it's client-side only
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const isQuillEmpty = (value) => {
  return (
    !value ||
    value === "<p><br></p>" ||
    !value.replace(/<(.|\n)*?>/g, "").trim()
  );
};

const validationSchema = Yup.object({
  question: Yup.string().required("Question is required"),

  answer: Yup.string().test(
    "is-not-empty",
    "Answer is required",
    (value) => !isQuillEmpty(value)
  ),
});

export default function AddFaqtForm({ id }) {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      question: "",
      answer: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("question", values.question);
      formData.append("answer", values.answer);

      try {
        let response;
        if (id) {
          formData.append("faq_id", id);
          response = await postRequest(`update-faq`, formData);
        } else {
          response = await postRequest("store-faq", formData);
        }

        if (response.data) {
          router.push("/dashboard/faq");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error("Failed to save product.");
      }
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getRequest(`faq-details/${id}`);
        if (response.data.Faq) {
          const data = response.data.Faq;
          formik.setValues({
            question: data.question,
            answer: data.answer,
          });          
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, formik.setValues]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-wrap gap-4 2xl:gap-5">
          {/* Product Name */}
          <div className=" w-full flex-grow">
            <div className="w-full relative pb-3.5">
              <label
                htmlFor="question"
                className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
              >
                Question
              </label>
              <Input
                id="question"
                type="text"
                placeholder="Question"
                maxLength={250}
                {...formik.getFieldProps("question")}
                className={
                  formik.touched.question && formik.errors.question
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.question && formik.errors.question && (
                <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                  {formik.errors.question}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className=" w-full flex-grow relative pb-3">
            <Label
              htmlFor="answer"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Answer
            </Label>
            <ReactQuill
              id="answer"
              name="answer"
              theme="snow"
              value={formik.values.answer}
              onChange={(value) => formik.setFieldValue("answer", value)}
              onBlur={() => formik.setFieldTouched("answer", true)}
              modules={textEditormodule.modules}
              className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
            />
            {formik.touched.answer && formik.errors.answer && (
              <p className="text-red-500 text-xs">{formik.errors.answer}</p>
            )}
          </div>

          <div className="w-full mt-4">
            <Button
              type="submit"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
              disabled={!formik.isValid}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
