import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div>
      <nav className="mb-6 flex gap-4 border-b border-gray-200 pb-3 text-sm font-medium">
        <Link href="/admin" className="text-gray-700 hover:text-nixor-maroon">
          Overview
        </Link>
        <Link href="/admin/courses" className="text-gray-700 hover:text-nixor-maroon">
          Courses
        </Link>
        <Link href="/admin/students" className="text-gray-700 hover:text-nixor-maroon">
          Students
        </Link>
        <Link href="/admin/enrollments" className="text-gray-700 hover:text-nixor-maroon">
          Enrollments
        </Link>
        <Link href="/admin/conflicts" className="text-gray-700 hover:text-nixor-maroon">
          Conflicts
        </Link>
        <Link href="/admin/audit-log" className="text-gray-700 hover:text-nixor-maroon">
          Audit Log
        </Link>
      </nav>
      {children}
    </div>
  );
}
