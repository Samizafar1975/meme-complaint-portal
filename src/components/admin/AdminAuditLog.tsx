"use client";

import { useEffect, useState } from "react";

interface EntryDTO {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string; email: string };
}

export function AdminAuditLog() {
  const [entries, setEntries] = useState<EntryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading audit log…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-nixon-maroon">Audit Log</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2">When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-100">
              <td className="py-2">{new Date(entry.createdAt).toLocaleString()}</td>
              <td>{entry.actor.name}</td>
              <td>{entry.action}</td>
              <td>
                {entry.entityType} #{entry.entityId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
