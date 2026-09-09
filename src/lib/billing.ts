// ============================================================================
// Plans & limits (P12, gating half) — pure, DOM-free, unit-tested.
//
// Free = a real inbox capped at 2 emails / limited text; Full = unlimited. This
// module holds ONLY the limit rules + plan parsing. The actual charging (Stripe)
// is a separate, deferred seam — per ROADMAP, we don't take money until the
// Canadian-hosting + managed-KMS sovereignty gates are real.
// ============================================================================

export type Plan = "free" | "full";
export const PLANS: Plan[] = ["free", "full"];

export type PlanLimits = {
  emailCap: number | null; // max ACTIVE derived items (null = unlimited)
  maxBodyChars: number | null; // truncate the text fed to the AI (null = full)
};

const LIMITS: Record<Plan, PlanLimits> = {
  free: { emailCap: 2, maxBodyChars: 2000 },
  full: { emailCap: null, maxBodyChars: null },
};

export function planLimits(plan: Plan): PlanLimits {
  return LIMITS[plan];
}

export function normalizePlan(raw: string | null | undefined): Plan {
  return raw === "full" ? "full" : "free";
}

// Has this user hit their plan's email cap (given their current ACTIVE count)?
export function atCap(plan: Plan, activeCount: number): boolean {
  const cap = LIMITS[plan].emailCap;
  return cap !== null && activeCount >= cap;
}

// How many more emails may be processed now (Infinity = unlimited).
export function remainingQuota(plan: Plan, activeCount: number): number {
  const cap = LIMITS[plan].emailCap;
  return cap === null ? Infinity : Math.max(0, cap - activeCount);
}
