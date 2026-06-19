"use client";

import { useState } from "react";
import { DAYS_OF_WEEK } from "@/lib/time";

export interface SessionFormValue {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string;
}

export interface CourseFormValue {
  name: string;
  category: "ENRICHMENT" | "HEADSTART" | "SPORTS";
  description: string;
  sessions: [SessionFormValue, SessionFormValue];
}

const emptySession: SessionFormValue = {
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  type: "",
};

export const emptyCourseForm: CourseFormValue = {
  name: "",
  category: "ENRICHMENT",
  description: "",
  sessions: [emptySession, { ...emptySession, dayOfWeek: "WEDNESDAY" }],
};

export function CourseForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: CourseFormValue;
  onSubmit: (value: CourseFormValue) => Promise<string | null>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [value, setValue] = useState<CourseFormValue>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function updateSession(index: 0 | 1, patch: Partial<SessionFormValue>) {
    setValue((prev) => {
      const sessions = [...prev.sessions] as [SessionFormValue, SessionFormValue];
      sessions[index] = { ...sessions[index], ...patch };
      return { ...prev, sessions };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await onSubmit(value);
    if (result) setError(result);
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-nixor-maroon/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input
            required
            value={value.name}
            onChange={(e) => setValue((p) => ({ ...p, name: e.target.value }))}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Category
          <select
            value={value.category}
            onChange={(e) =>
              setValue((p) => ({ ...p, category: e.target.value as CourseFormValue["category"] }))
            }
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          >
            <option value="ENRICHMENT">Enrichment</option>
            <option value="HEADSTART">Headstart</option>
            <option value="SPORTS">Sports</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea
          required
          value={value.description}
          onChange={(e) => setValue((p) => ({ ...p, description: e.target.value }))}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          rows={2}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <fieldset key={index} className="rounded border border-gray-200 p-3">
            <legend className="text-xs font-semibold text-gray-500">Session {index + 1}</legend>
            <label className="block text-sm mt-1">
              Day
              <select
                value={value.sessions[index as 0 | 1].dayOfWeek}
                onChange={(e) => updateSession(index as 0 | 1, { dayOfWeek: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="text-sm">
                Start
                <input
                  type="time"
                  required
                  value={value.sessions[index as 0 | 1].startTime}
                  onChange={(e) => updateSession(index as 0 | 1, { startTime: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                />
              </label>
              <label className="text-sm">
                End
                <input
                  type="time"
                  required
                  value={value.sessions[index as 0 | 1].endTime}
                  onChange={(e) => updateSession(index as 0 | 1, { endTime: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                />
              </label>
            </div>
            <label className="block text-sm mt-2">
              Type (optional)
              <input
                value={value.sessions[index as 0 | 1].type}
                onChange={(e) => updateSession(index as 0 | 1, { type: e.target.value })}
                placeholder="e.g. Practical"
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
              />
            </label>
          </fieldset>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-nixor-maroon px-4 py-2 text-sm font-medium text-white hover:bg-nixor-maroon-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
