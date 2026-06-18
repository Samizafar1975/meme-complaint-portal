"use client";

import { useEffect, useState } from "react";

interface StudentDTO {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  active: boolean;
  submittedAt: string | null;
}

export function AdminStudents() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/students");
    setStudents(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/students/import", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setImportResult(`Error: ${data.error}`);
    } else {
      setImportResult(
        `Imported: ${data.created} new, ${data.updated} updated, ${data.skipped.length} skipped.`,
      );
      await load();
    }
    setImporting(false);
    e.target.value = "";
  }

  async function toggleActive(student: StudentDTO) {
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !student.active }),
    });
    if (res.ok) await load();
  }

  if (loading) return <p className="text-gray-500">Loading students…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-nixor-maroon">Students</h1>

      <div className="rounded-lg border border-nixor-maroon/20 p-4">
        <h2 className="font-semibold mb-1">Import Roster</h2>
        <p className="text-sm text-gray-600 mb-3">
          CSV with columns: <code>name,email,studentId</code>. Re-importing updates existing
          students matched by email.
        </p>
        <input type="file" accept=".csv" onChange={handleImport} disabled={importing} />
        {importResult && <p className="text-sm mt-2">{importResult}</p>}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Student ID</th>
            <th>Status</th>
            <th>Schedule</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-gray-100">
              <td className="py-2">{student.name}</td>
              <td>{student.email}</td>
              <td>{student.studentId}</td>
              <td>{student.active ? "Active" : "Disabled"}</td>
              <td>{student.submittedAt ? "Submitted" : "Not submitted"}</td>
              <td>
                <button
                  onClick={() => toggleActive(student)}
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  {student.active ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
