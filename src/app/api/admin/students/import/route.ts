import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/authz";
import { logAction } from "@/lib/audit";

interface CsvRow {
  name?: string;
  email?: string;
  studentId?: string;
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "SUPER_ADMIN");
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "A CSV file upload named 'file' is required" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0) {
      return Response.json(
        { error: "Failed to parse CSV", details: parsed.errors.slice(0, 5) },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;
    const skipped: { row: number; reason: string }[] = [];

    for (const [index, row] of parsed.data.entries()) {
      const email = row.email?.trim().toLowerCase();
      const name = row.name?.trim();
      const studentId = row.studentId?.trim();
      if (!email || !name || !studentId) {
        skipped.push({ row: index + 2, reason: "Missing name, email, or studentId" });
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      await prisma.user.upsert({
        where: { email },
        update: { name, studentId },
        create: { email, name, studentId, role: "STUDENT" },
      });
      if (existing) updated += 1;
      else created += 1;
    }

    await logAction({
      actorId: session.user.id,
      action: "IMPORT_STUDENTS",
      entityType: "User",
      entityId: "bulk",
      after: { created, updated, skipped: skipped.length },
    });

    return Response.json({ created, updated, skipped });
  } catch (error) {
    return errorResponse(error);
  }
}
