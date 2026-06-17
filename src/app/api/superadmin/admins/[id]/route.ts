import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { logAction } from "@/lib/audit";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    if (id === session.user.id) {
      return Response.json({ error: "You cannot revoke your own access." }, { status: 400 });
    }

    const admin = await prisma.user.update({
      where: { id, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      data: { active: false },
    });

    await logAction({
      actorId: session.user.id,
      action: "REVOKE_ADMIN",
      entityType: "User",
      entityId: id,
    });

    return Response.json(admin);
  } catch (error) {
    return errorResponse(error);
  }
}
