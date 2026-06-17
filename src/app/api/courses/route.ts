import { prisma } from "@/lib/prisma";
import { requireSession, errorResponse } from "@/lib/authz";
import { courseToDTO } from "@/lib/dto";

export async function GET() {
  try {
    await requireSession();
    const courses = await prisma.course.findMany({
      include: { sessions: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return Response.json(courses.map(courseToDTO));
  } catch (error) {
    return errorResponse(error);
  }
}
