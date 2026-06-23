import { NextResponse } from "next/server";
import {
  microsoftConnection,
  microsoftOAuthConfigured,
  clearMicrosoftToken,
} from "@/lib/email/microsoftAuth";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/auth/microsoft/status — is M365 configured / connected, and for whom?
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const conn = await microsoftConnection(userId);
  return NextResponse.json({ configured: microsoftOAuthConfigured(), ...conn });
}

// DELETE /api/auth/microsoft/status — disconnect M365 (delete the stored token).
export async function DELETE() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  await clearMicrosoftToken(userId);
  return NextResponse.json({ ok: true });
}
