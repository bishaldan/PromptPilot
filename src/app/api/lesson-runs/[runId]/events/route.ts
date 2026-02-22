import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processTelemetryEvent } from "@/lib/lesson-runtime";
import { jsonError, requireUser, verifyRunTokenAuth } from "@/lib/http";
import { sha256 } from "@/lib/crypto";
import { StepDetectedEvent, TelemetryEventType } from "@/types/lesson";

const ALLOWED_EVENT_TYPES: TelemetryEventType[] = [
  "ELEMENT_FOUND",
  "CLICK",
  "INPUT_ACTIVITY",
  "RESPONSE_VISIBLE"
];

export async function POST(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const tokenAuth = verifyRunTokenAuth(request);
  let authorizedUserId: string | null = null;

  if (tokenAuth) {
    if (tokenAuth.runId !== params.runId) {
      return jsonError("Run token does not match route runId", 403);
    }
    authorizedUserId = tokenAuth.userId;
  } else {
    const { user, error } = await requireUser();
    if (!user) {
      return error;
    }
    authorizedUserId = user.id;
  }

  const run = await prisma.lessonRun.findUnique({
    where: { id: params.runId },
    include: {
      lesson: {
        include: {
          steps: {
            select: { id: true }
          }
        }
      }
    }
  });

  if (!run || run.userId !== authorizedUserId) {
    return jsonError("Run not found", 404);
  }

  const body = (await request.json().catch(() => null)) as Omit<StepDetectedEvent, "runId"> | null;
  if (!body?.stepId || !body.eventType || !body.url || !body.timestamp) {
    return jsonError("stepId, eventType, url, and timestamp are required", 400);
  }

  if (!ALLOWED_EVENT_TYPES.includes(body.eventType)) {
    return jsonError("Invalid eventType", 400);
  }

  const validStepIds = new Set(run.lesson.steps.map((step) => step.id));
  if (!validStepIds.has(body.stepId)) {
    return jsonError("stepId does not belong to this lesson", 400);
  }

  await prisma.telemetryEvent.create({
    data: {
      runId: run.id,
      stepId: body.stepId,
      eventType: body.eventType,
      selectorId: body.meta?.selectorId,
      inputLengthBucket: body.meta?.inputLengthBucket,
      urlHash: sha256(body.url)
    }
  });

  const result = await processTelemetryEvent(run.id, body);
  if (!result.state) {
    return jsonError("Run not found", 404);
  }

  return NextResponse.json({
    advanced: result.advanced,
    reason: result.reason,
    state: result.state
  });
}
