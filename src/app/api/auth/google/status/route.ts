import { NextResponse } from "next/server";
import {
  googleConnection,
  googleOAuthConfigured,
  clearGoogleToken,
} from "@/lib/email/googleAuth";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/auth/google/status — is Gmail configured / connected, and for whom?
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const conn = await googleConnection(userId);
  return NextResponse.json({ configured: googleOAuthConfigured(), ...conn });
}

// DELETE /api/auth/google/status — disconnect Gmail (delete the stored token).
export async function DELETE() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  await clearGoogleToken(userId);
  return NextResponse.json({ ok: true });
}
