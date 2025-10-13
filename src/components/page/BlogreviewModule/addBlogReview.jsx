"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomCombobox } from "@/components/common/customcombox";
import { Label } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
const validationSchema = Yup.object({
  blog_id: Yup.string().required("Listing is required"),
  user_id: Yup.string().required("User is required"),
  rating: Yup.string().required("Rating is required"),
  comment: Yup.string().required("Comment is required"),
});
const Ratinlist = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
  { id: 5, name: "5" },
];
function AddReviews() {
  const [user, setUser] = useState([]);
  const [listings, setListings] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getRequest("get-all-user");
        setUser(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
    };
    const fetchListings = async () => {
      try {
        const response = await getRequest("get-all-blog");
        setListings(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
    };
    fetchUsers();
    fetchListings();
  }, []);

  const formik = useFormik({
    initialValues: {
      blog_id: "",
      user_id: "",
      rating: "",
      comment: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formdata = new FormData();
      formdata.append("blog_id", values.blog_id);
      formdata.append("user_id", values.user_id);
      formdata.append("rating", values.rating);
      formdata.append("comment", values.comment);

      try {
        let response;
        response = await postRequest("add-blog-review", formdata);
        if (response.data) {
          router.push("/dashboard/blog-review");
          toast.success(response.message || "Product saved successfully!");
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        toast.error("Failed to save product.");
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        <div className="space-y-2  w-full flex-grow">
          <Label
            htmlFor="blog_id"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Blog
          </Label>
          <CustomCombobox
            name="blog_id"
            value={formik.values.blog_id}
            onChange={(value) => formik.setFieldValue("blog_id", value)}
            onBlur={() => formik.setFieldTouched("blog_id", true)}
            valueKey="_id"
            labelKey="blog_title"
            options={listings || []}
            placeholder="Select Blog "
            id="blog_id"
          />
          {formik.touched.blog_id && formik.errors.blog_id && (
            <p className="text-xs text-red-500">{formik.errors.blog_id}</p>
          )}
        </div>
        <div className="space-y-2  w-full flex-grow">
          <Label
            htmlFor="user_id"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            User
          </Label>
          <CustomCombobox
            name="user_id"
            value={formik.values.user_id}
            onChange={(value) => formik.setFieldValue("user_id", value)}
            onBlur={() => formik.setFieldTouched("user_id", true)}
            valueKey="_id"
            labelKey="name"
            options={user || []}
            placeholder="Select User"
            id="user_id"
          />
          {formik.touched.user_id && formik.errors.user_id && (
            <p className="text-xs text-red-500">{formik.errors.user_id}</p>
          )}
        </div>
        <div className="space-y-2 w-full flex-grow">
          <Label
            htmlFor="rating"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Rating
          </Label>
          <CustomCombobox
            name="rating"
            value={formik.values.rating}
            onChange={(value) => formik.setFieldValue("rating", value)}
            onBlur={() => formik.setFieldTouched("rating", true)}
            valueKey="id"
            labelKey="name"
            options={Ratinlist || []}
            placeholder="Select Rating"
            id="rating"
          />
          {formik.touched.rating && formik.errors.rating && (
            <p className="text-xs text-red-500">{formik.errors.rating}</p>
          )}
        </div>
        <div className="w-full flex-grow">
          <div className="w-full relative pb-3.5">
            <label
              htmlFor="comment"
              className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
            >
              Review Comment
            </label>
            <textarea
              id="comment"
              placeholder="comment......"
              rows={6}
              {...formik.getFieldProps("comment")}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                formik.touched.comment && formik.errors.comment ? "border-red-500" : ""
              )}
            />
            {formik.touched.comment && formik.errors.comment && (
              <div className="absolute bottom-0 left-0 text-red-500 text-xs">
                {formik.errors.comment}
              </div>
            )}
          </div>
        </div>
        {/* Save Button */}
        <div className="w-full mt-4">
          <Button
            type="submit"
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default AddReviews;
