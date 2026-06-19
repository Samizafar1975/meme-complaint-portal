"use client";

import { useEffect, useState } from "react";

interface RowDTO {
  studentId: string | null;
  name: string;
  email: string;
  submitted: boolean;
  submittedAt: string | null;
  courses: string[];
}

export function AdminEnrollments() {
  const [rows, setRows] = useState<RowDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/enrollments")
      .then((res) => res.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading enrollments…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-nixor-maroon">Enrollments</h1>
        <a
          href="/api/admin/enrollments?format=csv"
          className="rounded-md bg-nixor-maroon px-4 py-2 text-sm font-medium text-white hover:bg-nixor-maroon-dark"
        >
          Export CSV
        </a>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2">Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Courses</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.email} className="border-b border-gray-100 align-top">
              <td className="py-2">{row.studentId}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.submitted ? "Submitted" : "Not submitted"}</td>
              <td>{row.courses.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
