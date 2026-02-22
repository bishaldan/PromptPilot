import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      include: {
        lessons: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(
      tools.map((tool) => ({
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        icon: tool.icon ?? "📚",
        color: tool.color ?? "#888",
        description: tool.description ?? "",
        lessonCount: tool.lessons.length
      }))
    );
  } catch (error) {
    console.error("GET /api/tools error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
