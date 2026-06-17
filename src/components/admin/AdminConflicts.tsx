"use client";

import { useEffect, useState } from "react";

interface FlaggedDTO {
  studentId: string;
  name: string;
  email: string;
  conflictingCourses: { id: string; name: string }[];
}

export function AdminConflicts() {
  const [flagged, setFlagged] = useState<FlaggedDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/conflicts")
      .then((res) => res.json())
      .then((data) => {
        setFlagged(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Checking for conflicts…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-nixon-maroon">Conflicts</h1>
      <p className="text-sm text-gray-600">
        These students submitted a clash-free schedule, but a later course timing change by an
        admin has created a clash. Resolve manually via the Enrollments export.
      </p>
      {flagged.length === 0 ? (
        <p className="text-sm text-green-700">No conflicts detected. All submitted schedules are clash-free.</p>
      ) : (
        <ul className="space-y-3">
          {flagged.map((entry) => (
            <li key={entry.studentId} className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold">
                {entry.name} <span className="text-xs text-gray-500">({entry.email})</span>
              </p>
              <p className="text-sm text-red-700 mt-1">
                Clashing courses: {entry.conflictingCourses.map((c) => c.name).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
