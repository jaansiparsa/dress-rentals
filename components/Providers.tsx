"use client";

export default function Providers({ children }: { children: React.ReactNode }) {
  // No provider needed for Supabase Auth; just render children
  return <>{children}</>;
}
