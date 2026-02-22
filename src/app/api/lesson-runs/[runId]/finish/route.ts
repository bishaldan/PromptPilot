import { LessonRunStatus, LessonRunStepStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRunState } from "@/lib/lesson-runtime";

export async function POST(
  _request: Request,
  { params }: { params: { runId: string } }
) {
  const { user, error } = await requireUser();
  if (!user) {
    return error;
  }

  const run = await prisma.lessonRun.findUnique({
    where: { id: params.runId },
    include: {
      steps: true
    }
  });

  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (run.status === LessonRunStatus.COMPLETED) {
    const state = await getRunState(run.id);
    return NextResponse.json(state);
  }

  const unfinished = run.steps.some((step) => step.status !== LessonRunStepStatus.COMPLETED);
  if (unfinished) {
    return NextResponse.json({ error: "All steps must be completed before finishing" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.lessonRun.update({
      where: { id: run.id },
      data: {
        status: LessonRunStatus.COMPLETED,
        completedAt: new Date()
      }
    });

    await tx.badgeAward.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: run.lessonId
        }
      },
      update: {},
      create: {
        userId: user.id,
        lessonId: run.lessonId
      }
    });
  });

  const state = await getRunState(run.id);
  return NextResponse.json(state);
}
