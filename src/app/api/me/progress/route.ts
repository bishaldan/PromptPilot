import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser();
  if (!user) {
    return error;
  }

  const [runs, badges] = await Promise.all([
    prisma.lessonRun.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true
          }
        },
        steps: true
      },
      orderBy: { startedAt: "desc" }
    }),
    prisma.badgeAward.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { awardedAt: "desc" }
    })
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: (user as Record<string, unknown>).displayName ?? null,
      role: (user as Record<string, unknown>).role ?? "user",
    },
    runs: runs.map((run) => {
      const total = run.steps.length;
      const completed = run.steps.filter((step) => step.status === "COMPLETED").length;
      return {
        runId: run.id,
        lessonId: run.lesson.id,
        lessonTitle: run.lesson.title,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        progressPercent: total === 0 ? 0 : Math.round((completed / total) * 100)
      };
    }),
    badges: badges.map((badge) => ({
      lessonId: badge.lesson.id,
      lessonTitle: badge.lesson.title,
      awardedAt: badge.awardedAt
    }))
  });
}
