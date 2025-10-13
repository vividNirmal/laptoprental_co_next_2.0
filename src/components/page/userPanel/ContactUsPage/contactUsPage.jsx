"use client";
import Loader1 from "@/components/common/Loader";
import { userGetRequest, postRequest, userPostRequest } from "@/service/viewService";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactUsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    subject: Yup.string().required("Subject is required"),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await userPostRequest("submit-contact-us-form", formData);
        toast.success(response?.message || "Form submitted successfully!");
        formik.resetForm();
      } catch (error) {
        toast.error(error?.message || "Failed to submit form");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch contact page content
  const fetchContactUs = async () => {
    try {
      setLoading(true);
      const response = await userGetRequest(
        "get-static-page?page_name=Contact Us"
      );
      setData(response.data || null);
    } catch (err) {
      console.error("Failed to fetch content:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactUs();
  }, []);

  return (
    <section
      className="relative grow"
    >
      <div className="rz-app-wrap sm:rounded-xl container mx-auto flex flex-wrap items-start justify-center gap-4 pb-14 pt-1 xl:flex-nowrap xl:px-6 2xl:px-9">
        <div className="mx-auto w-full px-2.5">
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl flex flex-wrap lg:flex-nowrap">
            {/* Left Column - Content */}
            <div className="p-6 w-full lg:w-5/12 grow">
              {loading ? (
                <div className="w-full p-4 grid grid-cols-1 gap-2 [&>div]:!h-3 [&>div]:rounded-lg [&>div]:!bg-[#e2e2e2] [&>div]:border [&>div]:border-solid [&>div]:border-white [&>div]:!m-0">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                </div>
              ) : data?.page_content ? (
                <div
                  className={`max-w-full break-all break-words 
                  [&>h3]:text-xl [&>h3]:mb-3 [&>p+h3]:mt-3 [&>p]:empty:hidden [&>p]:text-black 
                  [&>h1,h2,h3,h4,h5,h6]:text-black [&>h1,h2,h3,h4,h5,h6]:mb-4 
                  [&>h4]:text-black [&>h5]:text-black [&>p]:text-xs [&>p]:mb-2.5 
                  [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 
                  [&>p]:sm:mb-3 [&>p]:lg:mb-4 animate-fadeIn`}
                  dangerouslySetInnerHTML={{ __html: data.page_content }}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    No content available at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-5/12 p-6 border-t lg:border-0 border-soolid border-gray-400">
              <h1 className="text-base 2xl:text-xl font-normal mb-4 text-gray-800">
                Contact us
              </h1>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    maxLength={250}
                    {...formik.getFieldProps("name")}
                    className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-xs text-red-500">{formik.errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    maxLength={250}
                    {...formik.getFieldProps("email")}
                    className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-xs text-red-500">{formik.errors.email}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Textarea
                    id="subject"
                    rows={4}
                    placeholder="Type your message here..."
                    {...formik.getFieldProps("subject")}
                    className={formik.touched.subject && formik.errors.subject ? "border-red-500" : ""}
                  />
                  {formik.touched.subject && formik.errors.subject && (
                    <p className="text-xs text-red-500">{formik.errors.subject}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#04AA6D] hover:bg-[#45a049] text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}