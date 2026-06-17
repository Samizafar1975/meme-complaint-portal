# Nixon College Enrollment Portal

Course enrollment system for Nixon College: students browse Enrichment,
Headstart, and Sports courses, build a basket, get live clash detection,
and submit a locked schedule once. Admins manage courses, import the
student roster, and control the enrollment window. Super Admins manage
admin access.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma (with the `@prisma/adapter-pg` driver adapter)
- NextAuth.js (Google OAuth, allow-list against the imported roster)

## Local setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from a Google Cloud OAuth client
   - `BOOTSTRAP_SUPER_ADMIN_EMAILS` — comma-separated emails allowed to
     self-provision as Super Admin the first time they sign in, but only
     while the `User` table is empty
2. Install dependencies and apply the schema:
   ```bash
   npm install
   npx prisma migrate dev
   ```
3. Run the app:
   ```bash
   npm run dev
   ```
4. Sign in with a Google account matching one of the
   `BOOTSTRAP_SUPER_ADMIN_EMAILS` to get the first Super Admin account, then
   use the Super Admin and Admin screens to add more staff and import the
   student CSV (`name,email,studentId` columns).

## Key rules encoded in the system

- Students may add any number of courses across categories to a basket;
  there are no seat limits or waitlists.
- Each course has exactly 2 fixed sessions per week. A basket item is
  flagged with a clash indicator the moment any of its sessions overlaps
  (same day, overlapping time range) with another basketed course.
- Submission is one-shot and locks the schedule (even an empty one).
  Server-side validation re-checks for clashes at submit time.
- Admins can edit/delete courses and toggle the enrollment window at any
  time. If an edit creates a clash for an already-submitted student, it
  shows up on `/admin/conflicts` for manual resolution (the `/admin/enrollments`
  CSV export is the source of truth for offline corrections).
- All admin/super-admin mutations are written to an audit log.
