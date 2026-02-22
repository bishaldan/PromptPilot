import { NextResponse, NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";

// GET /api/me/stats — aggregated user stats
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySessionToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [totalLessons, completedRuns, badgesEarned, completedSteps] = await Promise.all([
      prisma.lesson.count({ where: { isActive: true } }),
      prisma.lessonRun.count({ where: { userId: session.sub, status: "COMPLETED" } }),
      prisma.badgeAward.count({ where: { userId: session.sub } }),
      prisma.lessonRunStep.count({
        where: {
          run: { userId: session.sub },
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      ...user,
      totalLessons,
      completedLessons: completedRuns,
      badgesEarned,
      totalStepsCompleted: completedSteps,
    });
  } catch (error) {
    console.error("GET /api/me/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
