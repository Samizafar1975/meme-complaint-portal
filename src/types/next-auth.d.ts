import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      studentId: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
