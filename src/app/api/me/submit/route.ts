import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { findConflictingCourseIds } from "@/lib/time";
import { getSettings } from "@/lib/settings";
import { logAction } from "@/lib/audit";

export async function POST() {
  try {
    const session = await requireRole("STUDENT", "ADMIN", "SUPER_ADMIN");

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    if (user.submittedAt) {
      return Response.json(
        { error: "Your schedule is already submitted and locked." },
        { status: 409 },
      );
    }

    const settings = await getSettings();
    if (!settings.enrollmentOpen) {
      return Response.json({ error: "Enrollment is currently closed." }, { status: 409 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: { course: { include: { sessions: true } } },
    });

    const conflicting = findConflictingCourseIds(
      enrollments.map((enrollment) => ({
        id: enrollment.course.id,
        sessions: enrollment.course.sessions.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startMinute: s.startMinute,
          endMinute: s.endMinute,
        })),
      })),
    );

    if (conflicting.size > 0) {
      return Response.json(
        {
          error: "Your basket has clashing courses. Remove the conflict before submitting.",
          conflictingCourseIds: Array.from(conflicting),
        },
        { status: 409 },
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { submittedAt: new Date() },
    });

    await logAction({
      actorId: session.user.id,
      action: "SUBMIT_SCHEDULE",
      entityType: "User",
      entityId: session.user.id,
      after: { courseIds: enrollments.map((e) => e.courseId) },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
