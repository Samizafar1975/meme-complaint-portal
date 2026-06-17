import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ScheduleView } from "@/components/student/ScheduleView";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/");

  return <ScheduleView />;
}
