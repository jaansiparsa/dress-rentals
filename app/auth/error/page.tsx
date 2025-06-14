"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during sign in.";

  if (error === "AccessDenied") {
    errorMessage = "Only @berkeley.edu email addresses are allowed to sign in.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign In Error
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-500"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
