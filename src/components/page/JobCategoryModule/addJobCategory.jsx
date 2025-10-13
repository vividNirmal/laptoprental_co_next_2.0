"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { useFormik } from "formik";
import * as Yup from "yup";
import { ImageIcon, Loader2, X } from 'lucide-react';
import dynamic from "next/dynamic"; 
import { getRequest, postRequest } from "@/service/viewService"; 

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});



export default function AddJobCategory({categoryId}) {
  const iconInputRef = useRef(null);

  const [imgPreview, setImgPreview] = useState(null);
  const [submitLoader, setSubmitLoader] = useState(false);

  const router = useRouter();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Job Category Name is required'),
      slug: Yup.string().required('Job Category Slug is required'),
    }),
    onSubmit: async (values) => {
      setSubmitLoader(true);

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);

      if (values.img instanceof File) {
        formData.append('image', values.img);
      }


      let url;
      if (categoryId) {
        url = `update-job-catgeory/${categoryId}`;
      } else {
        url = 'store-job-category';
      }

      try {
        const res = await postRequest(url, formData);
        toast.success(res.message);
        router.push('/dashboard/job-category');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        toast.error(errorMessage);
      } finally {
        setSubmitLoader(false);
      }
    },
  });

  useEffect(() => {
    if (categoryId) {
      const fetchCategoryDetails = async () => {
        try {
          const res = await getRequest(`get-job-category-details/${categoryId}`);
          const data = res.data;
          formik.setValues({
            name: data.name,
            slug: data.slug,
            img: data.image,
          });
          setImgPreview(data.image);

        } catch (error) {
          console.error("Failed to fetch job category details:", error);
          toast.error("Failed to load Job category details.");
          router.push('/dashboard/job-category');
        }
      };
      fetchCategoryDetails();
    }
  }, [categoryId, router]);

  useEffect(() => {
    const nameValue = formik.values.name;
    const generatedSlug = nameValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!isSlugManuallyEdited || formik.values.slug === '') {
      formik.setFieldValue('slug', generatedSlug, false);
    }
  }, [formik.values.name, isSlugManuallyEdited, formik.values.slug]);

  const handleImageUpload = (e, field, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageDrop = (e, field, setPreview) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      formik.setFieldValue(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="flex flex-wrap gap-4 2xl:gap-5">
              {/* Category Name */}
              <div className="lg:w-[45%] w-full flex-grow">
                <div className="w-full relative pb-3.5">
                  <Label htmlFor="name" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    maxLength={250}
                    placeholder="Name"
                    {...formik.getFieldProps("name")}
                    className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                      {formik.errors.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Slug */}
              <div className="lg:w-[45%] w-full flex-grow">
                <div className="w-full relative pb-3.5">
                  <Label htmlFor="slug" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    type="text"
                    maxLength={250}
                    placeholder="Slug"
                    {...formik.getFieldProps("slug")}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setIsSlugManuallyEdited(true); // Mark as manually edited
                    }}
                    className={formik.touched.slug && formik.errors.slug ? "border-red-500" : ""}
                  />
                  {formik.touched.slug && formik.errors.slug && (
                    <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                      {formik.errors.slug}
                    </div>
                  )}
                </div>
              </div>


        <div className="flex flex-wrap relative w-full overflow-hidden pb-3">
      <div className="w-full flex-grow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block">Category Icon</span>
            <span
              className="text-[10px] 2xl:text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full block whitespace-nowrap max-w-96"
              >Please upload your images in .webp format for faster loading
            </span>
          </div>

        {!imgPreview ? (
          <label
            htmlFor="iconUpload"
            onDrop={(e) => handleImageDrop(e, 'img', setImgPreview)}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-6 h-6 text-gray-500 mb-2" />
              <p className="mb-2 text-xs text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <input
              ref={iconInputRef}
              id="iconUpload"
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'img', setImgPreview)}
            //   accept=".webp,image/webp,.svg,.png,.jpg,.jpeg,.gif"
            />
          </label>
        ) : (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
            <img
              src={imgPreview}
              alt="Icon Preview"
              className="w-full h-full object-cover"
              onDrop={(e) => handleImageDrop(e, 'img', setImgPreview)}
              onDragOver={(e) => e.preventDefault()}
            />
            <div className="absolute inset-0 bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  setImgPreview(null);
                  formik.setFieldValue('img', null);
                }}
                className="text-white bg-red-600 px-3 py-1 rounded text-xs mb-2"
              >
                Remove
              </button>
              <span className="text-white text-xs">Click or drop to replace</span>
            </div>
          </div>
        )}
      </div>
      </div>
            </div>

            {/* Submit Button */}
            <div className="w-full mt-6">
              <Button
                type="submit"
                disabled={submitLoader}
              >
                {submitLoader ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>

    </>
  );
}