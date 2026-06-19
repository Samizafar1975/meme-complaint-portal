import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { findConflictingCourseIds } from "@/lib/time";

// Detects students whose already-submitted schedule now contains a clash —
// this can only happen if an admin edits a course's timing after submission.
export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const submittedStudents = await prisma.user.findMany({
      where: { role: "STUDENT", submittedAt: { not: null } },
      include: {
        enrollments: { include: { course: { include: { sessions: true } } } },
      },
    });

    const flagged = submittedStudents
      .map((student) => {
        const courses = student.enrollments.map((e) => e.course);
        const conflicting = findConflictingCourseIds(
          courses.map((course) => ({
            id: course.id,
            sessions: course.sessions.map((s) => ({
              dayOfWeek: s.dayOfWeek,
              startMinute: s.startMinute,
              endMinute: s.endMinute,
            })),
          })),
        );
        if (conflicting.size === 0) return null;
        return {
          studentId: student.id,
          name: student.name,
          email: student.email,
          conflictingCourses: courses
            .filter((c) => conflicting.has(c.id))
            .map((c) => ({ id: c.id, name: c.name })),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return Response.json(flagged);
  } catch (error) {
    return errorResponse(error);
  }
}
