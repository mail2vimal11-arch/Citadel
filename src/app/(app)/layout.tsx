import Nav from "@/components/Nav";

// Chrome for the actual app (inbox / settings / audit). The marketing landing
// at "/" uses the bare root layout instead, so it has no app nav.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="container">{children}</main>
    </>
  );
}
