// This API route is no longer needed with Supabase Auth. You can safely delete this file.
// All authentication is now handled client-side with Supabase Auth (see Navbar and login page).

// If you want to keep a placeholder for future custom auth endpoints, you can leave this file empty or export a 404:

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Not implemented. Use Supabase Auth." },
    { status: 404 }
  );
}

export function POST() {
  return NextResponse.json(
    { error: "Not implemented. Use Supabase Auth." },
    { status: 404 }
  );
}
