import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const entries = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    });
    return Response.json(entries);
  } catch (error) {
    return errorResponse(error);
  }
}
