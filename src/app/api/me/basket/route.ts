import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { courseToDTO } from "@/lib/dto";
import { findConflictingCourseIds } from "@/lib/time";
import { getSettings } from "@/lib/settings";

async function loadBasket(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { include: { sessions: true } } },
  });
  const courses = enrollments.map((enrollment) => enrollment.course);
  const conflicting = findConflictingCourseIds(
    courses.map((course) => ({
      id: course.id,
      sessions: course.sessions.map((session) => ({
        dayOfWeek: session.dayOfWeek,
        startMinute: session.startMinute,
        endMinute: session.endMinute,
      })),
    })),
  );
  return courses.map((course) => ({
    ...courseToDTO(course),
    hasConflict: conflicting.has(course.id),
  }));
}

export async function GET() {
  try {
    const session = await requireRole("STUDENT", "ADMIN", "SUPER_ADMIN");
    const basket = await loadBasket(session.user.id);
    return Response.json({ basket });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
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

    const { courseId } = await request.json();
    if (!courseId || typeof courseId !== "string") {
      return Response.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
      update: {},
      create: { studentId: session.user.id, courseId },
    });

    const basket = await loadBasket(session.user.id);
    return Response.json({ basket });
  } catch (error) {
    return errorResponse(error);
  }
}
