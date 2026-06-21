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
  // Mark the cookie Secure only when the OAuth flow actually runs over HTTPS
  // (i.e. the redirect URI is https). Over an http://localhost tunnel — how the
  // VPS is tested — a Secure cookie would not be sent back, breaking the state
  // check, even under a production build. Key it off the real scheme instead.
  const secure = (process.env.GOOGLE_OAUTH_REDIRECT ?? "").startsWith("https://");
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 600,
  });
  return res;
}
