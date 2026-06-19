import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { courseToDTO } from "@/lib/dto";
import { courseInputSchema } from "@/lib/validation";
import { timeStringToMinutes } from "@/lib/time";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const courses = await prisma.course.findMany({
      include: { sessions: true, _count: { select: { enrollments: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return Response.json(
      courses.map((course) => ({
        ...courseToDTO(course),
        enrolledCount: course._count.enrollments,
      })),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const body = courseInputSchema.parse(await request.json());

    const course = await prisma.course.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        createdById: session.user.id,
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

    await logAction({
      actorId: session.user.id,
      action: "CREATE_COURSE",
      entityType: "Course",
      entityId: course.id,
      after: body,
    });

    return Response.json(courseToDTO(course), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
