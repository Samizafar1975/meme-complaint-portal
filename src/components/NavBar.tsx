"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function NavBar() {
  const { data: session } = useSession();

  if (!session?.user) return null;
  const role = session.user.role;

  return (
    <header className="bg-nixon-maroon text-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Nixon College &middot; Enrollment
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {role === "STUDENT" && (
            <>
              <Link href="/" className="hover:underline">
                Courses
              </Link>
              <Link href="/schedule" className="hover:underline">
                My Schedule
              </Link>
            </>
          )}
          {(role === "ADMIN" || role === "SUPER_ADMIN") && (
            <>
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
            </>
          )}
          {role === "SUPER_ADMIN" && (
            <Link href="/superadmin" className="hover:underline">
              Super Admin
            </Link>
          )}
          <span className="opacity-80">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
