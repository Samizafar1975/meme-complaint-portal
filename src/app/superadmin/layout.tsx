import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/");
  return <div>{children}</div>;
}
