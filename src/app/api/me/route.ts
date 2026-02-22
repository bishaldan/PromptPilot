import { NextResponse, NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";

// GET /api/me — full user profile with stats
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/me — update display name
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySessionToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { displayName } = body;

    if (typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.sub },
      data: { displayName: displayName.trim() },
      select: { id: true, email: true, displayName: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
