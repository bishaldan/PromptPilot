import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { createSessionToken } from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: string; password?: string; displayName?: string } | null;
    if (!body?.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(body.password),
        displayName: body.displayName?.trim() || null,
      }
    });

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
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
