"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-nixor-maroon/20 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-nixor-maroon">Nixor College</h1>
        <p className="mt-1 text-sm text-gray-600">Course Enrollment Portal</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-6 w-full rounded-md bg-nixor-maroon px-4 py-2 font-medium text-white hover:bg-nixor-maroon-dark"
        >
          Sign in with Google
        </button>
        <p className="mt-4 text-xs text-gray-500">
          Only accounts added by an administrator can access this portal.
        </p>
      </div>
    </div>
  );
}
