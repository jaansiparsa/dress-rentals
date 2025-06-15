"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function ProfileCheckProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    let ignore = false;
    const checkProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profileError) {
          // Optionally log error
        }
        if (
          !profileData &&
          !window.location.pathname.startsWith("/create-profile")
        ) {
          router.replace("/create-profile");
        }
      }
    };
    checkProfile();
  }, [router]);
  return children;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // No provider needed for Supabase Auth; just render children
  return <>{children}</>;
}
