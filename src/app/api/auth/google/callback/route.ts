import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/email/googleAuth";

export const dynamic = "force-dynamic";

// GET /api/auth/google/callback?code=...&state=...
// Google redirects here after the user approves (or denies) consent. We verify
// the CSRF state, exchange the code for tokens, then bounce back to the inbox
// with a ?gmail= status so the UI can show a message.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;
  // Behind a reverse proxy (Caddy + HTTPS) the app sees an internal http://host,
  // so prefer an explicitly configured public base URL for the bounce-back.
  // Land back on the inbox (the marketing landing lives at "/").
  const home = new URL("/inbox", process.env.APP_BASE_URL || req.url);

  const finish = (status: string) => {
    home.searchParams.set("gmail", status);
    const res = NextResponse.redirect(home);
    res.cookies.delete("g_oauth_state");
    return res;
  };

  if (url.searchParams.get("error")) return finish("denied");
  if (!code || !state || !cookieState || state !== cookieState) return finish("error");

  try {
    await exchangeCodeForToken(code);
    return finish("connected");
  } catch {
    return finish("error");
  }
}
