import { z } from "zod";
import { timeStringToMinutes } from "@/lib/time";

const timeString = z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Expected HH:mm");

const sessionInput = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: timeString,
    endTime: timeString,
    type: z.string().trim().max(50).optional().nullable(),
  })
  .refine((s) => timeStringToMinutes(s.endTime) > timeStringToMinutes(s.startTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const courseInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(["ENRICHMENT", "HEADSTART", "SPORTS"]),
  description: z.string().trim().min(1).max(2000),
  sessions: z.array(sessionInput).length(2, "A course must have exactly 2 sessions per week"),
});

export type CourseInput = z.infer<typeof courseInputSchema>;
