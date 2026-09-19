import { prisma } from "@/lib/db";

export type AuditEventType = "PROCESSED" | "FORGOTTEN" | "SETTINGS_CHANGED" | "DRAFTED" | "SENT";

// Write an append-only audit entry.
//
// IMPORTANT: callers must pass ONLY non-sensitive, content-free text. The audit
// log proves THAT something happened and WHEN — it must never contain the
// email content, the summary, the draft, or any key material.
export async function recordAudit(params: {
  userId: string;
  event: AuditEventType;
  message: string;
  itemId?: string;
  sourceRef?: string;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      userId: params.userId,
      event: params.event,
      message: params.message,
      itemId: params.itemId,
      sourceRef: params.sourceRef,
    },
  });
}

export async function listAudit(userId: string) {
  return prisma.auditEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
