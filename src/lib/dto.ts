import { minutesToTimeString } from "@/lib/time";
import type { Course, CourseSession } from "@/generated/prisma/client";

export function courseToDTO(course: Course & { sessions: CourseSession[] }) {
  return {
    id: course.id,
    name: course.name,
    category: course.category,
    description: course.description,
    sessions: course.sessions.map((session) => ({
      id: session.id,
      dayOfWeek: session.dayOfWeek,
      startTime: minutesToTimeString(session.startMinute),
      endTime: minutesToTimeString(session.endMinute),
      startMinute: session.startMinute,
      endMinute: session.endMinute,
      type: session.type,
    })),
  };
}
