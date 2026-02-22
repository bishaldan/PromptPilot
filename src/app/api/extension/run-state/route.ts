import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/http";
import { verifyLessonRunToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { getRunState } from "@/lib/lesson-runtime";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const payload = verifyLessonRunToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid lesson run token" }, { status: 401 });
  }

  const run = await prisma.lessonRun.findUnique({
    where: { id: payload.runId },
    select: { id: true, userId: true }
  });

  if (!run || run.userId !== payload.sub) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const state = await getRunState(run.id);
  return NextResponse.json(state);
}
