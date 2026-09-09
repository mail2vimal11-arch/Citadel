import { NextResponse } from "next/server";
import { buildConsentUrl, newState, microsoftOAuthConfigured } from "@/lib/email/microsoftAuth";

export const dynamic = "force-dynamic";

// GET /api/auth/microsoft — begin the read-only Microsoft 365 OAuth flow.
// Sets a short-lived CSRF "state" cookie, then redirects to Microsoft's consent.
export async function GET() {
  if (!microsoftOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Microsoft OAuth is not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in .env.local.",
      },
      { status: 500 }
    );
  }
  const state = newState();
  const res = NextResponse.redirect(buildConsentUrl(state));
  // Mark the cookie Secure only when the flow actually runs over HTTPS (the same
  // localhost-tunnel reasoning as the Google route).
  const secure = (process.env.MICROSOFT_OAUTH_REDIRECT ?? "").startsWith("https://");
  res.cookies.set("ms_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 600,
  });
  return res;
}
