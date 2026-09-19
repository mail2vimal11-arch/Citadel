import type { DefaultSession } from "next-auth";

// Expose the user id on the session (set in the `session` callback in auth.ts).
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
