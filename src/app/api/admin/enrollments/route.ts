import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      include: {
        enrollments: { include: { course: true } },
      },
    });

    const rows = students.map((student) => ({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      submitted: Boolean(student.submittedAt),
      submittedAt: student.submittedAt,
      courses: student.enrollments.map((e) => e.course.name),
    }));

    const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const header = "studentId,name,email,submitted,submittedAt,courses\n";
      const body = rows
        .map((row) =>
          [
            row.studentId,
            row.name,
            row.email,
            row.submitted,
            row.submittedAt?.toISOString() ?? "",
            `"${row.courses.join("; ")}"`,
          ].join(","),
        )
        .join("\n");
      return new Response(header + body, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=enrollments.csv",
        },
      });
    }

    return Response.json(rows);
  } catch (error) {
    return errorResponse(error);
  }
}
