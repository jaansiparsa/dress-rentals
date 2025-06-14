"use client";

import { useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";
import { createDress } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    types: [] as string[],
    colors: [] as string[],
    customColor: "",
    size: sizes[0],
    price: "",
    description: "",
    images: [] as File[],
    imagePreviews: [] as string[],
    pickupLocation: "",
    customPickupLocation: "",
  });
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  // Supabase Auth state
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check Supabase Auth session on mount
  useEffect(() => {
    let ignore = false;
    const getUser = async () => {
      setIsAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setSupabaseUser(data.user ?? null);
        setIsAuthLoading(false);
      }
    };
    getUser();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null);
      }
    );
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Redirect or show login if not authenticated
  if (isAuthLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  if (!supabaseUser) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to list a dress</h2>
        <button
          className="btn-primary"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider: "google" });
          }}
        >
          <img
            src="/google.svg"
            alt="Google"
            className="inline-block w-5 h-5 mr-2 align-middle"
          />
          Sign in with Google
        </button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArr = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...fileArr],
        imagePreviews: [
          ...(prev.imagePreviews || []),
          ...fileArr.map((file) => URL.createObjectURL(file)),
        ],
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
    if (!supabaseUser?.id) {
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
      if (!formData.images || formData.images.length === 0) {
        throw new Error("Please upload at least one image");
      }

      // Upload all images
      const imageUrls: string[] = [];
      for (const file of formData.images) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      // Ensure Supabase Auth is synced
      const { data: supaUserData } = await supabase.auth.getUser();
      console.log("Supabase user after setSession:", supaUserData);
      const userId = supaUserData?.user?.id;
      if (!userId) {
        toast.error(
          "You are not authenticated with Supabase. Please log out and log in again."
        );
        setIsSubmitting(false);
        return;
      }
      console.log("Supabase user data:", userId);

      // Prepare dress data
      const dressData = {
        owner_id: supabaseUser.id, // use the Supabase UUID
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
        image_url: imageUrls, // store as array
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
            Dress Images
          </label>
          <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center w-full">
              {formData.imagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-center mb-4">
                  {formData.imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative h-32 w-32">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const newImages = prev.images.filter(
                              (_, i) => i !== idx
                            );
                            const newPreviews = prev.imagePreviews.filter(
                              (_, i) => i !== idx
                            );
                            return {
                              ...prev,
                              images: newImages,
                              imagePreviews: newPreviews,
                            };
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload files</span>
                  <input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each. You can upload multiple images.
              </p>
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
              !formData.images.length
            }
          >
            {isSubmitting ? "Listing Dress..." : "List Dress"}
          </button>
        </div>
      </form>
    </div>
  );
}
