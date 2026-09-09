import { NextResponse } from "next/server";
import { currentUserId, UnauthenticatedError } from "@/lib/currentUser";

// Resolve the current user for an API route, or a 401 response to return early.
// Usage:
//   const userId = await requireUserId();
//   if (userId instanceof NextResponse) return userId;
export async function requireUserId(): Promise<string | NextResponse> {
  try {
    return await currentUserId();
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    throw e;
  }
}
