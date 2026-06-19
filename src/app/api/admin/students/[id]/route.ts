import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { logAction } from "@/lib/audit";

const patchSchema = z.object({ active: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const { active } = patchSchema.parse(await request.json());

    const student = await prisma.user.update({
      where: { id, role: "STUDENT" },
      data: { active },
    });

    await logAction({
      actorId: session.user.id,
      action: active ? "ACTIVATE_STUDENT" : "DEACTIVATE_STUDENT",
      entityType: "User",
      entityId: id,
      after: { active },
    });

    return Response.json(student);
  } catch (error) {
    return errorResponse(error);
  }
}
