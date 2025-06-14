"use client";

import { useEffect, useState } from "react";

import { createDress } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const dressTypes = ["Casual", "Semi-Formal", "Work", "Party", "Formal"];
const sizes = ["XS", "S", "M", "L", "XL"];

// Common colors for dresses
const commonColors = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Pink",
  "Purple",
  "Yellow",
  "Orange",
  "Navy",
  "Gray",
  "Silver",
  "Gold",
  "Beige",
  "Brown",
  "Other",
];

// Common pickup/dropoff locations on campus
const commonLocations = [
  "Moffitt Library",
  "Sather Gate",
  "Sproul Plaza",
  "Memorial Glade",
  "RSF (Recreational Sports Facility)",
  "MLK Student Union",
  "Other (specify below)",
];

export default function NewDressPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    types: [] as string[],
    colors: [] as string[],
    customColor: "",
    size: sizes[0],
    price: "",
    description: "",
    image: null as File | null,
    imagePreview: "",
    pickupLocation: "",
    customPickupLocation: "",
  });

  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Sync NextAuth session to Supabase Auth for storage RLS
  useEffect(() => {
    // Try common access token locations
    const accessToken = session?.accessToken || session?.user?.access_token;
    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken, // Use access token as refresh if no refresh token is available
      });
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image size must be less than 10MB");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Generate a unique file name
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${timestamp}-${randomString}.${fileExt}`;

      // Ensure we're using the correct path format
      const filePath = `dress-images/${fileName}`;

      console.log("Starting upload:", {
        fileName,
        filePath,
        fileType: file.type,
        fileSize: file.size,
      });

      // Upload the file directly without checking bucket existence
      const { data, error: uploadError } = await supabase.storage
        .from("dresses")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error details:", {
          error: uploadError,
          message: uploadError.message,
          name: uploadError.name,
        });
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      if (!data?.path) {
        throw new Error("No path returned from upload");
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("dresses").getPublicUrl(data.path);

      console.log("Upload successful:", {
        path: data.path,
        publicUrl,
      });

      return publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      throw new Error("Unknown error during image upload");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("You must be logged in to list a dress");
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate form data
      if (formData.types.length === 0) {
        throw new Error("Please select at least one dress type");
      }
      if (formData.colors.length === 0) {
        throw new Error("Please select at least one color");
      }
      if (!formData.image) {
        throw new Error("Please upload an image");
      }

      // Upload image first
      const imageUrl = await uploadImage(formData.image);

      // Prepare dress data
      const dressData = {
        owner_id: session.user.id, // changed from user_id to owner_id
        title: formData.title,
        types: formData.types,
        colors: formData.colors.includes("Other")
          ? [
              ...formData.colors.filter((c) => c !== "Other"),
              formData.customColor,
            ]
          : formData.colors,
        size: formData.size,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: imageUrl,
        pickup_location:
          formData.pickupLocation === "Other (specify below)"
            ? formData.customPickupLocation
            : formData.pickupLocation,
        custom_pickup_location:
          formData.pickupLocation === "Other (specify below)"
            ? formData.customPickupLocation
            : null,
      };

      // Create dress in database
      await createDress(dressData);

      toast.success("Dress listed successfully!");
      router.push("/dresses");
    } catch (error) {
      console.error("Error creating dress:", error);
      toast.error(
        error instanceof Error ? error.message : "Error creating dress"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDressType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
    setShowColorDropdown(false);
  };

  const removeColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">List a New Dress</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Dress Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Elegant Black Evening Gown"
          />
        </div>

        {/* Dress Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dress Types
          </label>
          <div className="flex flex-wrap gap-2">
            {dressTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleDressType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.types.includes(type)
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {formData.types.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Select at least one dress type
            </p>
          )}
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors
          </label>
          <div className="relative">
            {/* Selected Colors */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Color Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Add Colors
              </button>
              {showColorDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        formData.colors.includes(color) ? "bg-gray-50" : ""
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Color Input */}
            {formData.colors.includes("Other") && (
              <input
                type="text"
                name="customColor"
                value={formData.customColor}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="Enter custom color"
                required
              />
            )}

            {formData.colors.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Select at least one color
              </p>
            )}
          </div>
        </div>

        {/* Size */}
        <div>
          <label
            htmlFor="size"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Size
          </label>
          <select
            id="size"
            name="size"
            required
            value={formData.size}
            onChange={handleChange}
            className="input-field"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Daily Rental Price ($)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 50"
          />
        </div>

        {/* Pickup/Dropoff Location */}
        <div>
          <label
            htmlFor="pickupLocation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Pickup/Dropoff Location
          </label>
          <select
            id="pickupLocation"
            name="pickupLocation"
            required
            value={formData.pickupLocation}
            onChange={handleChange}
            className="input-field mb-2"
          >
            <option value="">Select a location</option>
            {commonLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {formData.pickupLocation === "Other (specify below)" && (
            <input
              type="text"
              name="customPickupLocation"
              value={formData.customPickupLocation}
              onChange={handleChange}
              className="input-field mt-2"
              placeholder="Enter your preferred pickup/dropoff location"
              required
            />
          )}
          <p className="mt-2 text-sm text-gray-500">
            This is where you'll meet to exchange the dress
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            placeholder="Describe your dress, including condition, brand, and any special features..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dress Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {formData.imagePreview ? (
                <div className="relative h-48 w-full mb-4">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        image: null,
                        imagePreview: "",
                      }))
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={
              isSubmitting ||
              formData.types.length === 0 ||
              formData.colors.length === 0 ||
              !formData.image
            }
          >
            {isSubmitting ? "Listing Dress..." : "List Dress"}
          </button>
        </div>
      </form>
    </div>
  );
}
