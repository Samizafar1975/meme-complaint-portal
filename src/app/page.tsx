import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentHome } from "@/components/student/StudentHome";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  return <StudentHome />;
}
