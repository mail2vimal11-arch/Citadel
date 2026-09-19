import { NextResponse } from "next/server";
import {
  googleAccounts,
  googleOAuthConfigured,
  clearGoogleToken,
} from "@/lib/email/googleAuth";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/auth/google/status — is Gmail configured, and which accounts are on?
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const accounts = await googleAccounts(userId);
  return NextResponse.json({ configured: googleOAuthConfigured(), accounts });
}

// DELETE /api/auth/google/status?accountId=... — disconnect ONE Gmail account
// (or all of them when accountId is omitted). Returns how many remain.
export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;
  const remaining = await clearGoogleToken(userId, accountId);
  return NextResponse.json({ ok: true, remaining });
}
