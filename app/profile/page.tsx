"use client";

import { useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const router = useRouter();

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

  useEffect(() => {
    if (!supabaseUser) return;
    // Fetch profile from public.profiles
    supabase
      .from("profiles")
      .select("full_name, avatar_url, email, phone")
      .eq("id", supabaseUser.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
    // Fetch user's listings
    supabase
      .from("dresses")
      .select("*")
      .eq("owner_id", supabaseUser.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setListings(data || []));
  }, [supabaseUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !supabaseUser) {
      router.push("/login");
    }
  }, [isAuthLoading, supabaseUser, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!supabaseUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Profile picture"}
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.full_name || supabaseUser.email}
              </h1>
              <p className="text-gray-600">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-gray-600">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-gray-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listings</p>
                <p className="text-gray-900">
                  {listings.length} dresses listed
                </p>
              </div>
              {/* You can add rentals count here if you track it */}
            </div>
          </div>

          {/* Middle Column - Active Listings */}
          <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Listings
              </h2>
              <button
                onClick={() => router.push("/dresses/new")}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                List a New Dress
              </button>
            </div>
            {listings.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>You haven't listed any dresses yet.</p>
                <button
                  onClick={() => router.push("/dresses/new")}
                  className="mt-2 text-primary-600 hover:text-primary-700"
                >
                  List your first dress →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((dress) => (
                  <div
                    key={dress.id}
                    className="bg-gray-50 border rounded-lg p-4 flex flex-col"
                  >
                    <div className="relative h-48 w-full mb-2">
                      <img
                        src={
                          Array.isArray(dress.image_url) &&
                          dress.image_url.length > 0
                            ? dress.image_url[0]
                            : "/placeholder.jpg"
                        }
                        alt={dress.title}
                        className="object-cover rounded-lg h-full w-full"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{dress.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(dress.types) &&
                        dress.types.map((type: string) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        Size {dress.size}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(dress.colors) &&
                        dress.colors.map((color: string) => (
                          <span
                            key={color}
                            className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
                          >
                            {color}
                          </span>
                        ))}
                    </div>
                    <div className="text-primary-700 font-bold mb-2">
                      ${dress.price}/day
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <a
                        href={`/dresses/${dress.id}`}
                        className="btn-primary flex-1 text-center"
                      >
                        View Details
                      </a>
                      {dress.owner_id === supabaseUser?.id && (
                        <a
                          href={`/dresses/${dress.id}/edit`}
                          className="btn-secondary flex-1 text-center"
                        >
                          Edit
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Notifications
              </label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Receive email notifications about your listings
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Visibility
              </label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Make my profile visible to other users
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
