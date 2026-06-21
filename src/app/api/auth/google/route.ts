import { NextResponse } from "next/server";
import { buildConsentUrl, newState, googleOAuthConfigured } from "@/lib/email/googleAuth";

export const dynamic = "force-dynamic";

// GET /api/auth/google — begin the read-only Gmail OAuth flow.
// Sets a short-lived CSRF "state" cookie, then redirects to Google's consent.
export async function GET() {
  if (!googleOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.",
      },
      { status: 500 }
    );
  }
  const state = newState();
  const res = NextResponse.redirect(buildConsentUrl(state));
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
