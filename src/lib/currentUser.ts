import { auth, authConfigured } from "@/auth";

// ============================================================================
// currentUserId — the single place that answers "whose data is this request?"
//
// Every data path (pipeline, inbox, forget, audit, settings, search, Gmail
// tokens) scopes by this id, which is how tenants stay isolated.
//
// DEMO fallback: when auth isn't configured, the app is single-user and we
// return a fixed demo id so the public prototype runs with no login.
// TODO(production): require a real session everywhere; remove the fallback.
// ============================================================================

export const DEMO_USER_ID = "demo-user";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthenticatedError";
  }
}

export async function currentUserId(): Promise<string> {
  if (!authConfigured()) return DEMO_USER_ID;
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  return session.user.id;
}
