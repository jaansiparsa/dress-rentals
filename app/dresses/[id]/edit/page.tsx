"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

const dressTypes = ["Casual", "Semi-Formal", "Work", "Party", "Formal"];
const sizes = ["XS", "S", "M", "L", "XL"];
const commonColors = [
  "Black","White","Red","Blue","Green","Pink","Purple","Yellow","Orange","Navy","Gray","Silver","Gold","Beige","Brown","Other",
];
const commonLocations = [
  "Moffitt Library","Sather Gate","Sproul Plaza","Memorial Glade","RSF (Recreational Sports Facility)","MLK Student Union","Other (specify below)",
];

export default function EditDressPage() {
  const router = useRouter();
  const params = useParams();
  const dressId = params?.id;
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    types: string[];
    colors: string[];
    customColor: string;
    size: string;
    price: string;
    description: string;
    images: File[];
    imagePreviews: string[];
    pickupLocation: string;
    customPickupLocation: string;
    image_url: string[];
  }>({
    title: "",
    types: [],
    colors: [],
    customColor: "",
    size: sizes[0],
    price: "",
    description: "",
    images: [],
    imagePreviews: [],
    pickupLocation: "",
    customPickupLocation: "",
    image_url: [],
  });
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setSupabaseUser(data.user ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!dressId) return;
    const fetchDress = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("dresses")
        .select("*")
        .eq("id", dressId)
        .maybeSingle();
      if (error || !data) {
        setError("Dress not found or you do not have permission to edit.");
        setIsLoading(false);
        return;
      }
      // Only allow owner to edit
      if (data.owner_id !== supabaseUser?.id) {
        setError("You do not have permission to edit this dress.");
        setIsLoading(false);
        return;
      }
      setFormData({
        title: data.title || "",
        types: data.types || [],
        colors: data.colors?.filter((c: string) => !commonColors.includes(c))?.length
          ? [...(data.colors || []).filter((c: string) => commonColors.includes(c)), "Other"]
          : data.colors || [],
        customColor: data.colors?.find((c: string) => !commonColors.includes(c)) || "",
        size: data.size || sizes[0],
        price: data.price?.toString() || "",
        description: data.description || "",
        images: [],
        imagePreviews: Array.isArray(data.image_url) ? data.image_url : (data.image_url ? [data.image_url] : []),
        pickupLocation: commonLocations.includes(data.pickup_location)
          ? data.pickup_location
          : "Other (specify below)",
        customPickupLocation: !commonLocations.includes(data.pickup_location)
          ? data.pickup_location
          : "",
        image_url: Array.isArray(data.image_url) ? data.image_url : (data.image_url ? [data.image_url] : []),
      });
      setIsLoading(false);
    };
    if (supabaseUser) fetchDress();
  }, [dressId, supabaseUser]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArr = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArr],
        imagePreviews: [
          ...prev.imagePreviews,
          ...fileArr.map((file) => URL.createObjectURL(file)),
        ],
        // Do not clear out old image_url; keep as is for existing images
        image_url: prev.image_url,
      }));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) throw new Error("Image size must be less than 10MB");
      if (!file.type.startsWith("image/")) throw new Error("File must be an image");
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `dress-images/${fileName}`;
      const { data, error: uploadError } = await supabase.storage
        .from("dresses")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      if (!data?.path) throw new Error("No path returned from upload");
      const { data: urlData } = supabase.storage.from("dresses").getPublicUrl(data.path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    if (!supabaseUser?.id) {
      setError("You must be logged in to edit a dress");
      setIsSubmitting(false);
      return;
    }
    if (formData.types.length === 0) {
      setError("Please select at least one dress type");
      setIsSubmitting(false);
      return;
    }
    if (formData.colors.length === 0) {
      setError("Please select at least one color");
      setIsSubmitting(false);
      return;
    }
    let imageUrls = formData.image_url;
    if (formData.images && formData.images.length > 0) {
      try {
        imageUrls = await uploadImages(formData.images);
      } catch (err: any) {
        setError(err.message);
        setIsSubmitting(false);
        return;
      }
    }
    const colors = formData.colors.includes("Other") && formData.customColor
      ? [...formData.colors.filter((c) => c !== "Other"), formData.customColor]
      : formData.colors;
    const pickup_location = formData.pickupLocation === "Other (specify below)"
      ? formData.customPickupLocation
      : formData.pickupLocation;
    const { error: updateError } = await supabase
      .from("dresses")
      .update({
        title: formData.title,
        types: formData.types,
        colors,
        size: formData.size,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: imageUrls,
        pickup_location,
        custom_pickup_location: formData.pickupLocation === "Other (specify below)" ? formData.customPickupLocation : null,
      })
      .eq("id", dressId);
    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }
    router.push("/profile");
  };

  const handleDelete = async () => {
    if (!dressId) return;
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("dresses").delete().eq("id", dressId);
      if (error) throw error;
      toast.success("Dress listing deleted.");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete dress.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dress...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button className="btn-primary" onClick={() => router.push("/profile")}>Back to Profile</button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Dress Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Dress Title</label>
          <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Elegant Black Evening Gown" />
        </div>
        {/* Dress Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dress Types</label>
          <div className="flex flex-wrap gap-2">
            {dressTypes.map((type) => (
              <button key={type} type="button" onClick={() => toggleDressType(type)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.types.includes(type) ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{type}</button>
            ))}
          </div>
          {formData.types.length === 0 && <p className="mt-2 text-sm text-gray-500">Select at least one dress type</p>}
        </div>
        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          <div className="relative">
            {/* Selected Colors */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors.map((color) => (
                <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">{color}<button type="button" onClick={() => removeColor(color)} className="hover:text-primary-900">×</button></span>
              ))}
            </div>
            {/* Color Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => setShowColorDropdown(!showColorDropdown)} className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">Add Colors</button>
              {showColorDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {commonColors.map((color) => (
                    <button key={color} type="button" onClick={() => toggleColor(color)} className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${formData.colors.includes(color) ? "bg-gray-50" : ""}`}>{color}</button>
                  ))}
                </div>
              )}
            </div>
            {/* Custom Color Input */}
            {formData.colors.includes("Other") && (
              <input type="text" name="customColor" value={formData.customColor} onChange={handleChange} className="input-field mt-2" placeholder="Enter custom color" required />
            )}
            {formData.colors.length === 0 && <p className="mt-2 text-sm text-gray-500">Select at least one color</p>}
          </div>
        </div>
        {/* Size */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select id="size" name="size" required value={formData.size} onChange={handleChange} className="input-field">
            {sizes.map((size) => (<option key={size} value={size}>{size}</option>))}
          </select>
        </div>
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Daily Rental Price ($)</label>
          <input type="number" id="price" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="input-field" placeholder="e.g., 50" />
        </div>
        {/* Pickup/Dropoff Location */}
        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-2">Pickup/Dropoff Location</label>
          <select id="pickupLocation" name="pickupLocation" required value={formData.pickupLocation} onChange={handleChange} className="input-field mb-2">
            <option value="">Select a location</option>
            {commonLocations.map((location) => (<option key={location} value={location}>{location}</option>))}
          </select>
          {formData.pickupLocation === "Other (specify below)" && (
            <input type="text" name="customPickupLocation" value={formData.customPickupLocation} onChange={handleChange} className="input-field mt-2" placeholder="Enter your preferred pickup/dropoff location" required />
          )}
          <p className="mt-2 text-sm text-gray-500">This is where you'll meet to exchange the dress</p>
        </div>
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="description" name="description" required rows={4} value={formData.description} onChange={handleChange} className="input-field" placeholder="Describe your dress, including condition, brand, and any special features..." />
        </div>
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dress Images</label>
          <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center w-full">
              {formData.imagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-center mb-4">
                  {formData.imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative h-32 w-32">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const newImages = prev.images.filter((_, i) => i !== idx);
                            const newPreviews = prev.imagePreviews.filter((_, i) => i !== idx);
                            const newImageUrls = prev.image_url.filter((_, i) => i !== idx);
                            return {
                              ...prev,
                              images: newImages,
                              imagePreviews: newPreviews,
                              image_url: newImageUrls,
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
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload files</span>
                      <input id="image-upload" name="image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} multiple />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each. You can upload multiple images.</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-between space-x-4 mt-8">
          <button type="button" onClick={() => router.back()} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || formData.types.length === 0 || formData.colors.length === 0}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete Listing
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
