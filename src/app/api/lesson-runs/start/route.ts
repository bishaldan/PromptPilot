import { LessonRunStepStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";
import { requireUser } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createLessonRunToken } from "@/lib/tokens";
import { getRunState } from "@/lib/lesson-runtime";

export async function POST(request: Request) {
  const { user, error } = await requireUser();
  if (!user) {
    return error;
  }

  const policyVersion = optionalEnv("POLICY_VERSION", "v1");
  const consent = await prisma.consent.findUnique({
    where: {
      userId_policyVersion: {
        userId: user.id,
        policyVersion
      }
    }
  });

  if (!consent) {
    return NextResponse.json({ error: "Consent required before starting a lesson" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { lessonId?: string } | null;
  if (!body?.lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: body.lessonId,
      isActive: true
    },
    include: {
      steps: {
        orderBy: {
          stepOrder: "asc"
        }
      }
    }
  });

  if (!lesson || lesson.steps.length === 0) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const run = await prisma.lessonRun.create({
    data: {
      userId: user.id,
      lessonId: lesson.id,
      steps: {
        create: lesson.steps.map((step, index) => ({
          lessonStepId: step.id,
          status: index === 0 ? LessonRunStepStatus.ACTIVE : LessonRunStepStatus.LOCKED,
          startedAt: index === 0 ? new Date() : null
        }))
      }
    }
  });

  const tokenData = createLessonRunToken(user.id, run.id);
  const state = await getRunState(run.id);

  return NextResponse.json({
    runId: run.id,
    lessonRunToken: tokenData.token,
    tokenExpiresAt: tokenData.expiresAt,
    state
  });
}
