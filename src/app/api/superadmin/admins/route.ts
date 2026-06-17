import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    return Response.json(admins);
  } catch (error) {
    return errorResponse(error);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole("SUPER_ADMIN");
    const body = createSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    const admin = await prisma.user.upsert({
      where: { email },
      update: { role: body.role, name: body.name, active: true },
      create: { email, name: body.name, role: body.role },
    });

    await logAction({
      actorId: session.user.id,
      action: "CREATE_OR_PROMOTE_ADMIN",
      entityType: "User",
      entityId: admin.id,
      after: body,
    });

    return Response.json(admin, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
