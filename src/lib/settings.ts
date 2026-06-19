import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, enrollmentOpen: true },
  });
}
