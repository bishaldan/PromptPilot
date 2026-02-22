import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { markManualCompletion } from "@/lib/lesson-runtime";

export async function POST(
  request: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const { user, error } = await requireUser();
    if (!user) {
      return error;
    }

    const run = await prisma.lessonRun.findUnique({
      where: { id: params.runId },
      select: { id: true, userId: true }
    });

    if (!run || run.userId !== user.id) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as { stepId?: string } | null;
    if (!body?.stepId) {
      return NextResponse.json({ error: "stepId is required" }, { status: 400 });
    }

    const state = await markManualCompletion(run.id, body.stepId);
    if (!state) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (err) {
    console.error(`POST /api/lesson-runs/${params.runId}/complete-step error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
