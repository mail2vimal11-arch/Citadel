import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, auth, authConfigured } from "@/auth";

export const metadata = { title: "Sign in · Citadel" };

export default async function SignIn() {
  // If auth isn't configured (demo mode) there's nothing to sign into — send to
  // the app. If already signed in, skip straight through.
  if (!authConfigured()) redirect("/inbox");
  const session = await auth();
  if (session) redirect("/inbox");

  return (
    <div className="mk" style={{ maxWidth: 460, minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div className="card" style={{ width: "100%", padding: "32px 28px", textAlign: "center" }}>
        <Link href="/" className="brand" style={{ justifyContent: "center", marginBottom: 18 }}>
          <span className="logo" aria-hidden>C</span>
          <span className="brand-text">
            <b>Citadel</b>
            <small>Your sovereign inbox</small>
          </span>
        </Link>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Sign in</h1>
        <p className="note" style={{ marginBottom: 22 }}>
          Sign in with the account whose mailbox you want Citadel to read.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/inbox" });
          }}
        >
          <button className="btn-primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
            Continue with Google
          </button>
        </form>
        <p className="note" style={{ marginTop: 18 }}>
          By continuing you agree this is a concept prototype — use a test account.
        </p>
      </div>
    </div>
  );
}
