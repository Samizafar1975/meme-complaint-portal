import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { getSettings } from "@/lib/settings";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const settings = await getSettings();
    return Response.json(settings);
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.object({ enrollmentOpen: z.boolean() });

export async function PATCH(request: Request) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const { enrollmentOpen } = patchSchema.parse(await request.json());

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: { enrollmentOpen },
      create: { id: 1, enrollmentOpen },
    });

    await logAction({
      actorId: session.user.id,
      action: enrollmentOpen ? "OPEN_ENROLLMENT" : "CLOSE_ENROLLMENT",
      entityType: "SystemSettings",
      entityId: "1",
      after: { enrollmentOpen },
    });

    return Response.json(settings);
  } catch (error) {
    return errorResponse(error);
  }
}
