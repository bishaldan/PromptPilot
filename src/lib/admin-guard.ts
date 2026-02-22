import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";

export type AdminContext = {
  userId: string;
  email: string;
};

/**
 * Validates that the request comes from an admin user.
 * Returns the admin context or a 403 response.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<AdminContext | NextResponse> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id, email: user.email };
}
