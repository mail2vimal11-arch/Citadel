import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { auth, authConfigured } from "@/auth";

// Chrome + auth gate for the app (inbox / settings / audit). When auth is
// configured, unauthenticated visitors are sent to /signin. In demo mode
// (no auth env) the app is open and single-user. The marketing landing at "/"
// uses the bare root layout instead, so it has no app nav.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (authConfigured()) {
    const session = await auth();
    if (!session) redirect("/signin");
  }
  return (
    <>
      <Nav />
      <main className="container">{children}</main>
    </>
  );
}
