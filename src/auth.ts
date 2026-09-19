import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// ============================================================================
// Auth.js (NextAuth v5) — sign-in + sessions, Prisma-backed.
//
// Provider: Google (matches the mailbox you connect). Database sessions via the
// Prisma adapter put User/Account/Session rows in our own schema — the
// multi-tenancy backbone. The `session` callback exposes the user id so app
// code can scope every query to its owner.
//
// DEMO: when AUTH_SECRET / AUTH_GOOGLE_* are unset, auth is "not configured"
// and the app runs single-user (see currentUserId) — the public demo keeps
// working with no login. Set those env vars to turn real sign-in on.
//
// TODO(production): add Microsoft sign-in (P5) and enterprise SSO/SAML (P14,
// via a dedicated provider such as WorkOS/BoxyHQ).
// ============================================================================

export function authConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  // Google reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from the environment.
  providers: [Google],
  pages: { signIn: "/signin" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
