import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — platform-wide analytics
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const [totalUsers, totalLessons, totalCompletions, totalBadges, toolStats] =
    await Promise.all([
      prisma.user.count(),
      prisma.lesson.count({ where: { isActive: true } }),
      prisma.lessonRun.count({ where: { status: "COMPLETED" } }),
      prisma.badgeAward.count(),
      prisma.tool.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          _count: { select: { lessons: true } },
        },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalLessons,
    totalCompletions,
    totalBadges,
    tools: toolStats.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      lessonCount: t._count.lessons,
    })),
  });
}
