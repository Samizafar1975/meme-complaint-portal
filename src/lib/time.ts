// Time helpers for HH:mm <-> minutes-since-midnight, and session overlap checks.

export function timeStringToMinutes(value: string): number {
  const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time "${value}", expected HH:mm`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export interface SessionInterval {
  dayOfWeek: string;
  startMinute: number;
  endMinute: number;
}

/** Two sessions clash if they're on the same day and their [start, end) ranges overlap. */
export function sessionsOverlap(a: SessionInterval, b: SessionInterval): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  return a.startMinute < b.endMinute && b.startMinute < a.endMinute;
}

export interface CourseWithSessions {
  id: string;
  sessions: SessionInterval[];
}

/**
 * Given a set of selected courses, returns the ids of courses that have at
 * least one session clashing with a session from a different course.
 */
export function findConflictingCourseIds(courses: CourseWithSessions[]): Set<string> {
  const conflicting = new Set<string>();
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const courseA = courses[i];
      const courseB = courses[j];
      for (const sessionA of courseA.sessions) {
        for (const sessionB of courseB.sessions) {
          if (sessionsOverlap(sessionA, sessionB)) {
            conflicting.add(courseA.id);
            conflicting.add(courseB.id);
          }
        }
      }
    }
  }
  return conflicting;
}

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
