import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

function bootstrapSuperAdminEmails(): string[] {
  return (process.env.BOOTSTRAP_SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return existing.active;
      }

      // No users imported yet at all: allow a one-time bootstrap of the
      // configured Super Admin account(s) so the system isn't a dead end.
      const userCount = await prisma.user.count();
      if (userCount === 0 && bootstrapSuperAdminEmails().includes(email)) {
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? email,
            role: "SUPER_ADMIN",
          },
        });
        return true;
      }

      // Anyone not already in the imported roster is rejected — no
      // self-registration is allowed.
      return false;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.studentId = dbUser.studentId;
        }
      }
      return token;
    },
  },
});
