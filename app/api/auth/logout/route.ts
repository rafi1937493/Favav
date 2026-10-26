import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Session ended. Browser storage and session cookies have been cleared.",
  });

  // Clear-Site-Data tells the browser engine to wipe cookies and client storage
  response.headers.set("Clear-Site-Data", '"cookies", "storage"');
  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

export async function GET() {
  return POST();
}
