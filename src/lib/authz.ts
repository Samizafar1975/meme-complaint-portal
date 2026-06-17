import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("Not signed in");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(`Requires role: ${roles.join(" or ")}`);
  }
  return session;
}

export function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return new Response(JSON.stringify({ error: error.message }), { status: 403 });
  }
  const message = error instanceof Error ? error.message : "Internal error";
  return new Response(JSON.stringify({ error: message }), { status: 400 });
}
