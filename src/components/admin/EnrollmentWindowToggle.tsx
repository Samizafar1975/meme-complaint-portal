"use client";

import { useEffect, useState } from "react";

export function EnrollmentWindowToggle() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/enrollment-window")
      .then((res) => res.json())
      .then((data) => setOpen(data.enrollmentOpen));
  }, []);

  async function toggle() {
    if (open === null) return;
    setBusy(true);
    const res = await fetch("/api/admin/enrollment-window", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentOpen: !open }),
    });
    const data = await res.json();
    setOpen(data.enrollmentOpen);
    setBusy(false);
  }

  if (open === null) return null;

  return (
    <div className="rounded-lg border border-nixor-maroon/20 p-4 flex items-center justify-between">
      <div>
        <h2 className="font-semibold">Enrollment Window</h2>
        <p className="text-sm text-gray-600">
          Students can {open ? "currently submit schedules" : "not submit schedules right now"}.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
          open ? "bg-gray-700 hover:bg-gray-800" : "bg-nixor-maroon hover:bg-nixor-maroon-dark"
        }`}
      >
        {open ? "Close Enrollment" : "Open Enrollment"}
      </button>
    </div>
  );
}
