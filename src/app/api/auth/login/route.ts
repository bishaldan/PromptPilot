import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { createSessionToken } from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
    if (!body?.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = createSessionToken(user.id, user.email);
    const response = NextResponse.json({
      id: user.id,
      email: user.email
    });

    response.cookies.set("session_token", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
