import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// Edge-safe config: no Prisma import here, since this also backs the
// middleware which runs on the Edge runtime. DB-dependent callbacks
// (signIn allow-list check, jwt enrichment) live only in auth.ts.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as Role;
        session.user.studentId = (token.studentId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
