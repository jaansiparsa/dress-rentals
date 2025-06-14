"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const getUser = async () => {
      setIsAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setSupabaseUser(data.user ?? null);
        setIsAuthLoading(false);
        // If user exists, check if profile exists
        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();
          if (profileError) {
            console.error("Profile check error:", profileError);
          }
          if (!profileData) {
            // No profile, redirect to create-profile page
            router.push("/create-profile");
            return;
          }
        }
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSupabaseUser(session?.user ?? null);
      }
    );
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (supabaseUser) {
      (async () => {
        alert("supabaseUser detected: " + JSON.stringify(supabaseUser));
        try {
          const { error, data } = await supabase.from("profiles").upsert({
            id: supabaseUser.id,
            full_name:
              supabaseUser.user_metadata?.full_name || supabaseUser.email,
            avatar_url: supabaseUser.user_metadata?.avatar_url || null,
            email: supabaseUser.email,
          });
          if (error) {
            alert("Profile upsert error: " + error.message);
          } else {
            alert("Profile upserted: " + JSON.stringify(data));
          }
        } catch (err) {
          alert("Exception: " + err);
        }
        router.push("/");
      })();
    }
  }, [supabaseUser, router]);

  // Show loading state while checking session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account to continue
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({ provider: "google" });
            }}
            type="button"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Image
              src="/google.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="mr-2"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
