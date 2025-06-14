"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "Profile picture"}
                className="h-20 w-20 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.name}
              </h1>
              <p className="text-gray-600">{session.user.email}</p>
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
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listings</p>
                <p className="text-gray-900">0 dresses listed</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rentals</p>
                <p className="text-gray-900">0 dresses rented</p>
              </div>
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
            <div className="text-center py-8 text-gray-600">
              <p>You haven't listed any dresses yet.</p>
              <button
                onClick={() => router.push("/dresses/new")}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                List your first dress →
              </button>
            </div>
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
