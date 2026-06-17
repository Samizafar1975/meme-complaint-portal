"use client";

import { useEffect, useState } from "react";
import { CourseForm, CourseFormValue, emptyCourseForm } from "./CourseForm";

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
  enrolledCount: number;
}

function toFormValue(course: CourseDTO): CourseFormValue {
  return {
    name: course.name,
    category: course.category as CourseFormValue["category"],
    description: course.description,
    sessions: [
      {
        dayOfWeek: course.sessions[0].dayOfWeek,
        startTime: course.sessions[0].startTime,
        endTime: course.sessions[0].endTime,
        type: course.sessions[0].type ?? "",
      },
      {
        dayOfWeek: course.sessions[1].dayOfWeek,
        startTime: course.sessions[1].startTime,
        endTime: course.sessions[1].endTime,
        type: course.sessions[1].type ?? "",
      },
    ],
  };
}

export function AdminCourses() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/courses");
    setCourses(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCourse(value: CourseFormValue) {
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const data = await res.json();
      return data.error ?? "Failed to create course";
    }
    setCreating(false);
    await load();
    return null;
  }

  async function updateCourse(id: string, value: CourseFormValue) {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const data = await res.json();
      return data.error ?? "Failed to update course";
    }
    setEditingId(null);
    await load();
    return null;
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course? Students who selected it will lose it from their schedule."))
      return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="text-gray-500">Loading courses…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-nixon-maroon">Courses</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-nixon-maroon px-4 py-2 text-sm font-medium text-white hover:bg-nixon-maroon-dark"
          >
            + New Course
          </button>
        )}
      </div>

      {creating && (
        <CourseForm
          initial={emptyCourseForm}
          submitLabel="Create Course"
          onCancel={() => setCreating(false)}
          onSubmit={createCourse}
        />
      )}

      <div className="space-y-3">
        {courses.map((course) =>
          editingId === course.id ? (
            <CourseForm
              key={course.id}
              initial={toFormValue(course)}
              submitLabel="Save Changes"
              onCancel={() => setEditingId(null)}
              onSubmit={(value) => updateCourse(course.id, value)}
            />
          ) : (
            <div
              key={course.id}
              className="rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold">
                  {course.name}{" "}
                  <span className="text-xs font-normal text-gray-500">({course.category})</span>
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">{course.description}</p>
                <ul className="text-sm text-gray-600 mt-1">
                  {course.sessions.map((s) => (
                    <li key={s.id}>
                      {s.dayOfWeek.slice(0, 3)} {s.startTime}–{s.endTime}
                      {s.type ? ` · ${s.type}` : ""}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-1">
                  {course.enrolledCount} student{course.enrolledCount === 1 ? "" : "s"} enrolled
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditingId(course.id)}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
