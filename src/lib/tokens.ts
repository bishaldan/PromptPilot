import { createHmac } from "crypto";
import { requiredEnv } from "@/lib/env";

type TokenPayload = {
  sub: string;
  email?: string;
  runId?: string;
  exp: number;
  iat: number;
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

function createToken(payload: TokenPayload, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${headerPart}.${payloadPart}`, secret);
  return `${headerPart}.${payloadPart}.${signature}`;
}

function verifyToken<T extends TokenPayload>(token: string, secret: string): T | null {
  const [headerPart, payloadPart, signature] = token.split(".");
  if (!headerPart || !payloadPart || !signature) {
    return null;
  }

  const expectedSignature = sign(`${headerPart}.${payloadPart}`, secret);
  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as T;
    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export type SessionPayload = {
  sub: string;
  email: string;
  exp: number;
  iat: number;
};

export function createSessionToken(userId: string, email: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7;
  return createToken({ sub: userId, email, iat, exp }, requiredEnv("AUTH_SECRET"));
}

export function verifySessionToken(token: string): SessionPayload | null {
  return verifyToken<SessionPayload>(token, requiredEnv("AUTH_SECRET"));
}

export type LessonRunPayload = {
  sub: string;
  runId: string;
  exp: number;
  iat: number;
};

export function createLessonRunToken(userId: string, runId: string): { token: string; expiresAt: string } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 30;
  return {
    token: createToken({ sub: userId, runId, iat, exp }, requiredEnv("LESSON_TOKEN_SECRET")),
    expiresAt: new Date(exp * 1000).toISOString()
  };
}

export function verifyLessonRunToken(token: string): LessonRunPayload | null {
  return verifyToken<LessonRunPayload>(token, requiredEnv("LESSON_TOKEN_SECRET"));
}
