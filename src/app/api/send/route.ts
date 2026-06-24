import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/apiUser";
import { sendEmail, NeedsReconnectError, type SendProvider } from "@/lib/email/send";
import { recordAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// POST /api/send { provider, accountId, to, subject, body } — send mail as the
// connected account (read-write). Raw content is NOT stored; we record only a
// content-free SENT audit event. The client confirms before calling this.
//
// TODO(production): an outbound queue + retry; threaded replies with real
// Message-ID/References; rate limits.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const b = await req.json().catch(() => ({}));
  const provider = b?.provider as SendProvider | undefined;
  const accountId = typeof b?.accountId === "string" ? b.accountId : "";
  const to = typeof b?.to === "string" ? b.to.trim() : "";
  const subject = typeof b?.subject === "string" ? b.subject : "";
  const body = typeof b?.body === "string" ? b.body : "";

  if ((provider !== "gmail" && provider !== "microsoft") || !accountId || !to || !body) {
    return NextResponse.json({ ok: false, error: "Provide provider, accountId, to and body." }, { status: 400 });
  }

  try {
    await sendEmail(userId, provider, accountId, {
      to,
      subject,
      body,
      inReplyTo: typeof b?.inReplyTo === "string" ? b.inReplyTo : undefined,
      references: typeof b?.references === "string" ? b.references : undefined,
    });
    // Content-free: provider + account only, never the recipient/subject/body.
    await recordAudit({ userId, event: "SENT", message: `Sent 1 email via a connected ${provider} account.` });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof NeedsReconnectError) {
      return NextResponse.json(
        { ok: false, needsReconnect: true, provider: e.provider, error: "Reconnect this account to grant send permission." },
        { status: 403 }
      );
    }
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Send failed." }, { status: 502 });
  }
}
