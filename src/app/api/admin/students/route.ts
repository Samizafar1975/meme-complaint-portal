import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        active: true,
        submittedAt: true,
      },
    });
    return Response.json(students);
  } catch (error) {
    return errorResponse(error);
  }
}
