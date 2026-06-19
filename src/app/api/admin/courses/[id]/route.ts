import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { courseToDTO } from "@/lib/dto";
import { courseInputSchema } from "@/lib/validation";
import { timeStringToMinutes } from "@/lib/time";
import { logAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const body = courseInputSchema.parse(await request.json());

    const before = await prisma.course.findUnique({
      where: { id },
      include: { sessions: true },
    });
    if (!before) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.courseSession.deleteMany({ where: { courseId: id } });
      return tx.course.update({
        where: { id },
        data: {
          name: body.name,
          category: body.category,
          description: body.description,
          sessions: {
            create: body.sessions.map((s) => ({
              dayOfWeek: s.dayOfWeek,
              startMinute: timeStringToMinutes(s.startTime),
              endMinute: timeStringToMinutes(s.endTime),
              type: s.type ?? null,
            })),
          },
        },
        include: { sessions: true },
      });
    });

    await logAction({
      actorId: session.user.id,
      action: "UPDATE_COURSE",
      entityType: "Course",
      entityId: id,
      before: courseToDTO(before),
      after: body,
    });

    return Response.json(courseToDTO(updated));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const { id } = await params;

    const before = await prisma.course.findUnique({
      where: { id },
      include: { sessions: true },
    });
    if (!before) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({ where: { id } });

    await logAction({
      actorId: session.user.id,
      action: "DELETE_COURSE",
      entityType: "Course",
      entityId: id,
      before: courseToDTO(before),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
