"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  category: "ENRICHMENT" | "HEADSTART" | "SPORTS";
  description: string;
  sessions: SessionDTO[];
}

interface BasketCourseDTO extends CourseDTO {
  hasConflict: boolean;
}

const CATEGORY_LABELS: Record<CourseDTO["category"], string> = {
  ENRICHMENT: "Enrichment Classes",
  HEADSTART: "Headstart Classes",
  SPORTS: "Sports Classes",
};

function SessionSummary({ sessions }: { sessions: SessionDTO[] }) {
  return (
    <ul className="text-sm text-gray-600">
      {sessions.map((s) => (
        <li key={s.id}>
          {s.dayOfWeek.slice(0, 3)} {s.startTime}–{s.endTime}
          {s.type ? ` · ${s.type}` : ""}
        </li>
      ))}
    </ul>
  );
}

export function StudentHome() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [basket, setBasket] = useState<BasketCourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    const [scheduleRes, coursesRes, basketRes] = await Promise.all([
      fetch("/api/me/schedule"),
      fetch("/api/courses"),
      fetch("/api/me/basket"),
    ]);
    const schedule = await scheduleRes.json();
    if (schedule.submitted) {
      router.replace("/schedule");
      return;
    }
    setCourses(await coursesRes.json());
    const basketData = await basketRes.json();
    setBasket(basketData.basket);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const basketIds = useMemo(() => new Set(basket.map((c) => c.id)), [basket]);
  const hasAnyConflict = basket.some((c) => c.hasConflict);

  async function addCourse(courseId: string) {
    setError(null);
    setBusyCourseId(courseId);
    const res = await fetch("/api/me/basket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add course");
    } else {
      setBasket(data.basket);
    }
    setBusyCourseId(null);
  }

  async function removeCourse(courseId: string) {
    setError(null);
    setBusyCourseId(courseId);
    const res = await fetch(`/api/me/basket/${courseId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to remove course");
    } else {
      setBasket((prev) => prev.filter((c) => c.id !== courseId));
    }
    setBusyCourseId(null);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/me/submit", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit");
      setSubmitting(false);
      return;
    }
    router.replace("/schedule");
  }

  if (loading) return <p className="text-gray-500">Loading courses…</p>;

  const grouped = (Object.keys(CATEGORY_LABELS) as CourseDTO["category"][]).map((category) => ({
    category,
    courses: courses.filter((c) => c.category === category),
  }));

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        {grouped.map(({ category, courses }) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-bold text-nixon-maroon">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-3">
              {courses.length === 0 && (
                <p className="text-sm text-gray-400">No courses in this category yet.</p>
              )}
              {courses.map((course) => {
                const inBasket = basketIds.has(course.id);
                return (
                  <div
                    key={course.id}
                    className="rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{course.description}</p>
                      <SessionSummary sessions={course.sessions} />
                    </div>
                    <button
                      disabled={busyCourseId === course.id}
                      onClick={() => (inBasket ? removeCourse(course.id) : addCourse(course.id))}
                      className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                        inBasket
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-nixon-maroon text-white hover:bg-nixon-maroon-dark"
                      } disabled:opacity-50`}
                    >
                      {inBasket ? "Remove" : "Add to basket"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="md:col-span-1">
        <div className="sticky top-4 rounded-lg border border-nixon-maroon/20 p-4">
          <h2 className="font-bold text-nixon-maroon mb-3">Your Basket</h2>
          {basket.length === 0 && (
            <p className="text-sm text-gray-500">No courses added yet.</p>
          )}
          <ul className="space-y-2 mb-4">
            {basket.map((course) => (
              <li key={course.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{course.name}</span>
                <span aria-label={course.hasConflict ? "Clash" : "No clash"}>
                  {course.hasConflict ? (
                    <span className="text-red-600 font-bold">✕</span>
                  ) : (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {hasAnyConflict && (
            <p className="text-sm text-red-600 mb-3">
              Some courses clash. Remove a clashing course before submitting.
            </p>
          )}
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting || hasAnyConflict}
            className="w-full rounded-md bg-nixon-maroon px-4 py-2 font-medium text-white hover:bg-nixon-maroon-dark disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Schedule"}
          </button>
        </div>
      </aside>
    </div>
  );
}
