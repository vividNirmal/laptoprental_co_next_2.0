"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { textEditormodule } from "@/lib/constant";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Helper function to check if Quill editor is empty
const isQuillEmpty = (value) => {
  return !value || value === "<p><br></p>" || !value.replace(/<(.|\n)*?>/g, "").trim();
};

// Validation schema
const validationSchema = Yup.object({
  marketingbanner_description: Yup.string().test(
    "is-not-empty",
    "Newsletter content is required",
    (value) => !isQuillEmpty(value || "")
  ),
});


export default function MarketingContent  ()  {
  // State management
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableListings, setAvailableListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      marketingbanner_image: null,
      marketingbanner_description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();

        // Add image if exists
        if (values.marketingbanner_image) {
          formData.append("marketingbanner_image", values.marketingbanner_image);
        }

        // Add description
        formData.append("marketingbanner_description", values.marketingbanner_description);

        // Add selected listings
        selectedListings.forEach((item) => {
          formData.append("marketingbanner_listing_id[]", item.listing_unique_id);
        });

        const res = await apiPost("/update-marketing-banner", formData);

        if (res.status === 1) {
          toast.success(res.message || "Marketing updated successfully!");
        } else {
          toast.error(res.message || "Failed to update newsletter.");
        }
      } catch (error) {
        console.error("Marketing update error:", error);
        toast.error(error.message || "Failed to update newsletter.");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch newsletter details
  const fetchNewsletterDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet("/marketing-banner-details");
      const data = response.data;

      setAvailableListings(data.available_listings || []);
      setSelectedListings(data.marketing_banner.marketingbanner_listing_id || []);

      const description = data.marketing_banner?.marketingbanner_description || "";
      formik.setFieldValue("marketingbanner_description", description);

      // Set existing banner image if available
      const bannerImage = data.marketing_banner.marketingbanner_image;
      if (bannerImage) {
        setImagePreview({
          src: bannerImage,
          isNew: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch newsletter details:", error);
      toast.error("Failed to load newsletter details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletterDetails();
  }, [fetchNewsletterDetails]);

  // Filtered listings with useMemo for performance
  const filteredAvailable = useMemo(
    () =>
      availableListings.filter((item) =>
        item.name.toLowerCase().includes(searchAvailable.toLowerCase())
      ),
    [availableListings, searchAvailable]
  );

  const filteredSelected = useMemo(
    () =>
      selectedListings.filter((item) =>
        item.name.toLowerCase().includes(searchSelected.toLowerCase())
      ),
    [selectedListings, searchSelected]
  );

  // Image handling
  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large (max 5MB).`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has unsupported format.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview({
          src: reader.result,
          isNew: true,
          file,
        });
        formik.setFieldValue("marketingbanner_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    formik.setFieldValue("marketingbanner_image", null);
  }, [formik]);

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Drag and drop handlers for listings
  const handleDragStart = useCallback((item, source) => {
    setDraggedItem(item);
    setDragSource(source);
  }, []);

  const handleDragOver = useCallback((e, target) => {
    e.preventDefault();
    setDragOverTarget(target);
  }, []);

  const handleDrop = useCallback(
    (e, target) => {
      e.preventDefault();

      if (!draggedItem || dragSource === target) {
        setDraggedItem(null);
        setDragSource(null);
        setDragOverTarget(null);
        return;
      }

      if (dragSource === "available" && target === "selected") {
        if (!selectedListings.some((i) => i.id === draggedItem.id)) {
          setSelectedListings((prev) => [...prev, draggedItem]);
          setAvailableListings((prev) => prev.filter((i) => i.id !== draggedItem.id));
        }
      } else if (dragSource === "selected" && target === "available") {
        if (!availableListings.some((i) => i.id === draggedItem.id)) {
          setAvailableListings((prev) => [...prev, draggedItem]);
          setSelectedListings((prev) => prev.filter((i) => i.id !== draggedItem.id));
        }
      }

      setDraggedItem(null);
      setDragSource(null);
      setDragOverTarget(null);
    },
    [draggedItem, dragSource, selectedListings, availableListings]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragSource(null);
    setDragOverTarget(null);
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
      {loading ? (
        <Loader2 className="h-10 w-10 mx-auto animate-spin" />
      ) : (
        <div>
          {/* Banner Image Upload */}
          <div className="w-full ">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs 2xl:text-base font-normal text-slate-500">
                Marketing Banner
              </Label>
              <span className="text-xs bg-gray-200 text-red-500 p-0.5 px-2.5 rounded-full whitespace-nowrap">
                Please upload your images in .webp format for faster loading
              </span>
            </div>

            <label
              htmlFor="banner-image-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                formik.touched.marketingbanner_image && formik.errors.marketingbanner_image
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
            >
              {imagePreview ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={imagePreview.src || "/placeholder.svg"}
                    alt="Banner Preview"
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                </div>
              )}
              <input
                id="banner-image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                name="marketingbanner_image"
              />
            </label>

            {formik.touched.marketingbanner_image && formik.errors.marketingbanner_image && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.marketingbanner_image}
              </div>
            )}
          </div>

          {/* Newsletter Content Editor */}
          <div className="w-full mt-3">
            <Label
              htmlFor="marketingbanner_description"
              className="text-xs 2xl:text-base font-normal text-slate-500 block mb-2"
            >
              Marketing Short Description
            </Label>

            <ReactQuill
              id="marketingbanner_description"
              theme="snow"
              value={formik.values.marketingbanner_description}
              onChange={(value) => formik.setFieldValue("marketingbanner_description", value)}
              onBlur={() => formik.setFieldTouched("marketingbanner_description", true)}
              modules={textEditormodule?.modules}
              className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
            />

            {formik.touched.marketingbanner_description && formik.errors.marketingbanner_description && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.marketingbanner_description}</p>
            )}
          </div>

          {/* Listings Selection */}
          <div className="flex gap-8 mt-3">
            {/* Available Listings */}
            <div className="flex-1">
              <Label className="text-xs 2xl:text-base font-normal text-slate-500 block mb-2">
                Available Listings
              </Label>

              <Input
                type="text"
                placeholder="Search available listings..."
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
                className="mb-2"
              />

              <div
                className={`max-h-72 overflow-y-auto border border-gray-200 rounded-xl min-h-[100px] transition-all duration-150 ${
                  dragOverTarget === "available" ? "ring-2 ring-blue-400 bg-blue-50" : ""
                }`}
                onDrop={(e) => handleDrop(e, "available")}
                onDragOver={(e) => handleDragOver(e, "available")}
                onDragLeave={() => setDragOverTarget(null)}
              >
                {filteredAvailable.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No available listings</div>
                ) : (
                  filteredAvailable.map((item,index) => (
                    <div
                      key={index}
                      className={`p-3 border-b border-gray-100 cursor-move hover:bg-gray-50 transition-colors ${
                        draggedItem && draggedItem.id === item.id && dragSource === "available"
                          ? "bg-blue-100 opacity-70"
                          : ""
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(item, "available")}
                      onDragEnd={handleDragEnd}
                    >
                      {item.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected Listings */}
            <div className="flex-1">
              <Label className="text-xs 2xl:text-base font-normal text-slate-500 block mb-2">
                Selected Listings
              </Label>

              <Input
                type="text"
                placeholder="Search selected listings..."
                value={searchSelected}
                onChange={(e) => setSearchSelected(e.target.value)}
                className="mb-2"
              />

              <div
                className={`max-h-72 overflow-y-auto border border-gray-200 rounded-xl min-h-[100px] transition-all duration-150 ${
                  dragOverTarget === "selected" ? "ring-2 ring-blue-400 bg-blue-50" : ""
                }`}
                onDrop={(e) => handleDrop(e, "selected")}
                onDragOver={(e) => handleDragOver(e, "selected")}
                onDragLeave={() => setDragOverTarget(null)}
              >
                {filteredSelected.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No selected listings</div>
                ) : (
                  filteredSelected.map((item,index) => (
                    <div
                      key={index}
                      className={`p-3 border-b border-gray-100 cursor-move hover:bg-gray-50 transition-colors ${
                        draggedItem && draggedItem.id === item.id && dragSource === "selected"
                          ? "bg-blue-100 opacity-70"
                          : ""
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(item, "selected")}
                      onDragEnd={handleDragEnd}
                    >
                      {item.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full pt-5">
            <Button
              type="submit"
              className="bg-[#7367f0] text-white hover:bg-[#5e57d1] transition-colors px-6 py-2 min-w-36"
              disabled={loading || formik.isSubmitting}
            >
              {loading || formik.isSubmitting ? "Saving..." : "Save Newsletter"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

