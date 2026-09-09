import { NextResponse } from "next/server";
import {
  microsoftAccounts,
  microsoftOAuthConfigured,
  clearMicrosoftToken,
} from "@/lib/email/microsoftAuth";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/auth/microsoft/status — configured? and which accounts are connected?
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const accounts = await microsoftAccounts(userId);
  return NextResponse.json({ configured: microsoftOAuthConfigured(), accounts });
}

// DELETE /api/auth/microsoft/status?accountId=... — disconnect ONE account (or
// all when accountId is omitted). Returns how many remain.
export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;
  const remaining = await clearMicrosoftToken(userId, accountId);
  return NextResponse.json({ ok: true, remaining });
}
