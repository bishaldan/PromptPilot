import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { toolId: string } }
) {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: params.toolId },
      include: {
        lessons: {
          where: { isActive: true },
          include: {
            steps: {
              orderBy: { stepOrder: "asc" }
            }
          },
          orderBy: { title: "asc" }
        }
      }
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      lessons: tool.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        category: lesson.category,
        estimatedMinutes: lesson.estimatedMinutes,
        steps: lesson.steps.map((step) => ({
          coachText: ((step.configJson as { coachText?: string | null } | null) ?? {}).coachText ?? undefined,
          id: step.id,
          order: step.stepOrder,
          instruction: step.instruction,
          actionType: step.actionType,
          completionRule: step.completionRule,
          allowManualConfirm: step.allowManualConfirm,
          urlPattern: step.urlPattern,
          targetSelectors: step.targetSelectors
        }))
      }))
    });
  } catch (error) {
    console.error(`GET /api/tools/${params.toolId}/lessons error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
