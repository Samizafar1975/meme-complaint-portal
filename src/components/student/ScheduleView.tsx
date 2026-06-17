"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionDTO {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string | null;
}

interface CourseDTO {
  id: string;
  name: string;
  category: string;
  description: string;
  sessions: SessionDTO[];
}

export function ScheduleView() {
  const [data, setData] = useState<{
    submitted: boolean;
    submittedAt: string | null;
    courses: CourseDTO[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/me/schedule")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-gray-500">Loading…</p>;

  if (!data.submitted) {
    return (
      <div>
        <p className="text-gray-600">
          You haven&apos;t submitted a schedule yet.{" "}
          <Link href="/" className="text-nixon-maroon underline">
            Go build your basket
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-nixon-maroon mb-1">My Schedule</h1>
      <p className="text-sm text-gray-500 mb-6">
        Submitted on {data.submittedAt ? new Date(data.submittedAt).toLocaleString() : ""}. This
        schedule is locked.
      </p>
      {data.courses.length === 0 ? (
        <p className="text-gray-500">You submitted an empty schedule (no courses).</p>
      ) : (
        <div className="space-y-3">
          {data.courses.map((course) => (
            <div key={course.id} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{course.description}</p>
              <ul className="text-sm text-gray-600 mt-1">
                {course.sessions.map((s) => (
                  <li key={s.id}>
                    {s.dayOfWeek.slice(0, 3)} {s.startTime}–{s.endTime}
                    {s.type ? ` · ${s.type}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
