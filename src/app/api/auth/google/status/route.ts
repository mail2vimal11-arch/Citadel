import { NextResponse } from "next/server";
import {
  googleConnection,
  googleOAuthConfigured,
  clearGoogleToken,
} from "@/lib/email/googleAuth";

export const dynamic = "force-dynamic";

// GET /api/auth/google/status — is Gmail configured / connected, and for whom?
export async function GET() {
  const conn = await googleConnection();
  return NextResponse.json({ configured: googleOAuthConfigured(), ...conn });
}

// DELETE /api/auth/google/status — disconnect Gmail (delete the stored token).
export async function DELETE() {
  await clearGoogleToken();
  return NextResponse.json({ ok: true });
}
