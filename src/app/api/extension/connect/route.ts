import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/http";
import { verifyLessonRunToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { getRunState } from "@/lib/lesson-runtime";

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing bearer token" }, { status: 401 });
  }

  const payload = verifyLessonRunToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid lesson run token" }, { status: 401 });
  }

  const run = await prisma.lessonRun.findUnique({
    where: { id: payload.runId },
    select: { id: true, userId: true }
  });

  if (!run || run.userId !== payload.sub) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }

  const state = await getRunState(run.id);

  return NextResponse.json({
    ok: true,
    runId: run.id,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    state
  });
}
