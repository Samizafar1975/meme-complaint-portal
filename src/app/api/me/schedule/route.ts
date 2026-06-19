import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { courseToDTO } from "@/lib/dto";

export async function GET() {
  try {
    const session = await requireRole("STUDENT", "ADMIN", "SUPER_ADMIN");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: { course: { include: { sessions: true } } },
    });

    return Response.json({
      submitted: Boolean(user.submittedAt),
      submittedAt: user.submittedAt,
      courses: enrollments.map((e) => courseToDTO(e.course)),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
