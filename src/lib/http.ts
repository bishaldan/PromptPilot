import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLessonRunToken, verifySessionToken } from "@/lib/tokens";

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function getSessionUser() {
  const cookieStore = cookies();
  const rawToken = cookieStore.get("session_token")?.value;
  if (!rawToken) {
    return null;
  }

  const payload = verifySessionToken(rawToken);
  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: payload.sub } });
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { error: jsonError("Unauthorized", 401) as NextResponse, user: null };
  }
  return { error: null, user };
}

export type RunTokenAuth = {
  userId: string;
  runId: string;
  token: string;
};

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export function verifyRunTokenAuth(request: Request): RunTokenAuth | null {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const payload = verifyLessonRunToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub,
    runId: payload.runId,
    token
  };
}
