import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRunState } from "@/lib/lesson-runtime";

export async function GET(
  _request: Request,
  { params }: { params: { runId: string } }
) {
  const { user, error } = await requireUser();
  if (!user) {
    return error;
  }

  const run = await prisma.lessonRun.findUnique({
    where: { id: params.runId },
    select: { id: true, userId: true }
  });

  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Lesson run not found" }, { status: 404 });
  }

  const state = await getRunState(run.id);
  return NextResponse.json(state);
}
