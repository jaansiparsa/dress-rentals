"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatarFile: null,
    avatarPreview: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setFormData((prev) => ({
          ...prev,
          email: data.user.email || "",
          fullName: data.user.user_metadata?.full_name || "",
        }));
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile" && files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        avatarFile: files[0],
        avatarPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    let avatar_url = null;
    try {
      if (formData.avatarFile) {
        const fileExt = formData.avatarFile.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, formData.avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatar_url = publicUrlData.publicUrl;
      }
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        avatar_url,
      });
      if (upsertError) throw upsertError;
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">
          Create Your Profile
        </h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="input-field w-full bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              name="avatarFile"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            {formData.avatarPreview && (
              <img
                src={formData.avatarPreview}
                alt="Avatar Preview"
                className="h-20 w-20 rounded-full mt-2 object-cover"
              />
            )}
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
