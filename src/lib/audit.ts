import { prisma } from "@/lib/prisma";

export async function logAction(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.before === undefined ? undefined : (params.before as object),
      after: params.after === undefined ? undefined : (params.after as object),
    },
  });
}
