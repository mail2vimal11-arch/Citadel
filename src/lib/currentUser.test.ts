import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth module so we can drive authConfigured()/auth() per test without
// touching real env or NextAuth. currentUserId is the tenancy chokepoint, so
// this proves the demo fallback and the authenticated/unauthenticated branches.
const authConfigured = vi.fn();
const auth = vi.fn();
vi.mock("@/auth", () => ({
  authConfigured: () => authConfigured(),
  auth: () => auth(),
}));

import { currentUserId, DEMO_USER_ID, UnauthenticatedError } from "@/lib/currentUser";

beforeEach(() => {
  authConfigured.mockReset();
  auth.mockReset();
});

describe("currentUserId", () => {
  it("returns the demo id when auth is not configured (public prototype)", async () => {
    authConfigured.mockReturnValue(false);
    expect(await currentUserId()).toBe(DEMO_USER_ID);
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns the session user id when configured and signed in", async () => {
    authConfigured.mockReturnValue(true);
    auth.mockResolvedValue({ user: { id: "user-123" } });
    expect(await currentUserId()).toBe("user-123");
  });

  it("throws UnauthenticatedError when configured but no session", async () => {
    authConfigured.mockReturnValue(true);
    auth.mockResolvedValue(null);
    await expect(currentUserId()).rejects.toBeInstanceOf(UnauthenticatedError);
  });
});
