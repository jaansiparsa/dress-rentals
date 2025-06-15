"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { getDress } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DressDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [dress, setDress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDress(params.id)
      .then(async (data) => {
        setDress(data);
        // Fetch owner profile from public.profiles table instead of admin API
        if (data?.owner_id) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email")
            .eq("id", data.owner_id)
            .maybeSingle();
          if (!profileError && profile) {
            setOwnerProfile(profile);
          }
        }
      })
      .catch((err) => setError(err.message || "Failed to load dress"))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Move hooks to the top-level, before any early returns
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  const calculateTotal = () => {
    if (selectedDates.length < 2) return dress.price;
    const days = Math.ceil(
      (selectedDates[1].getTime() - selectedDates[0].getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return dress.price * days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dress...</p>
        </div>
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error || "Dress not found."}
          </p>
          <button onClick={() => router.back()} className="mt-4 btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Main Image or Carousel */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-4">
          {Array.isArray(dress.image_url) && dress.image_url.length > 1 ? (
            <>
              <Image
                src={dress.image_url[selectedImage]}
                alt={dress.title}
                fill
                className="object-cover"
                priority
              />
              {/* Carousel Controls */}
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white"
                onClick={() => setSelectedImage((prev) => (prev === 0 ? dress.image_url.length - 1 : prev - 1))}
                aria-label="Previous image"
              >
                &#8592;
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white"
                onClick={() => setSelectedImage((prev) => (prev === dress.image_url.length - 1 ? 0 : prev + 1))}
                aria-label="Next image"
              >
                &#8594;
              </button>
              {/* Thumbnails */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white/60 rounded px-2 py-1">
                {dress.image_url.map((img: string, idx: number) => (
                  <button
                    key={img}
                    type="button"
                    className={`h-8 w-8 rounded overflow-hidden border-2 ${selectedImage === idx ? 'border-primary-600' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={img} alt="thumbnail" className="object-cover h-full w-full" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Image
              src={Array.isArray(dress.image_url) ? (dress.image_url[0] || '/placeholder.jpg') : (dress.image_url || '/placeholder.jpg')}
              alt={dress.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          {dress.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-2">
          {Array.isArray(dress.types) &&
            dress.types.map((type: string) => (
              <span
                key={type}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
              >
                {type}
              </span>
            ))}
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
            Size {dress.size}
          </span>
          {Array.isArray(dress.colors) &&
            dress.colors.map((color: string) => (
              <span
                key={color}
                className="px-2 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
              >
                {color}
              </span>
            ))}
        </div>
        <p className="text-lg font-bold text-primary-700 mb-2">
          ${dress.price}/day
        </p>
        <div className="mb-2">
          <span className="font-semibold">Pickup Location:</span>{" "}
          {dress.pickup_location}
          {dress.custom_pickup_location && (
            <span> ({dress.custom_pickup_location})</span>
          )}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Description:</span>
          <p className="text-gray-700 mt-1">{dress.description}</p>
        </div>
        <div className="text-sm text-gray-500">
          Listed on{" "}
          {new Date(dress.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {/* Owner Info */}
        {ownerProfile && (
          <div className="flex items-center gap-4 mb-4">
            {ownerProfile.avatar_url && (
              <img
                src={ownerProfile.avatar_url}
                alt={ownerProfile.full_name || "Profile picture"}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <div className="font-semibold text-primary-900">
                {ownerProfile.full_name || ownerProfile.email}
              </div>
              <div className="text-sm text-gray-500">Owner</div>
            </div>
            {/* Edit button if current user is owner */}
            <EditButton ownerId={dress.owner_id} dressId={dress.id} />
          </div>
        )}
      </div>
    </div>
  );
}

// Add this component at the bottom of the file (outside the main component):
function EditButton({ ownerId, dressId }: { ownerId: string; dressId: string }) {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  const [debug, setDebug] = useState<{userId?: string, ownerId?: string}>();
  const router = useRouter();
  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) {
        setIsOwner(data.user?.id === ownerId);
        setChecked(true);
        setDebug({ userId: data.user?.id, ownerId });
      }
    });
    return () => { ignore = true; };
  }, [ownerId]);
  if (!checked) return null; // Only render after check
  if (!isOwner) return (
    <div style={{ fontSize: 10, color: '#888' }}>
      {/* Debug info for troubleshooting */}
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
  return (
    <button
      className="ml-4 btn-secondary"
      onClick={() => router.push(`/dresses/${dressId}/edit`)}
    >
      Edit Listing
    </button>
  );
}
