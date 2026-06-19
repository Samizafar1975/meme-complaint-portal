import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await requireRole("STUDENT", "ADMIN", "SUPER_ADMIN");
    const { courseId } = await params;

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    if (user.submittedAt) {
      return Response.json(
        { error: "Your schedule is already submitted and locked." },
        { status: 409 },
      );
    }

    await prisma.enrollment.deleteMany({
      where: { studentId: session.user.id, courseId },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
