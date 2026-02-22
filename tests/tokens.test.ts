import { beforeEach, describe, expect, it } from "vitest";
import {
  createLessonRunToken,
  createSessionToken,
  verifyLessonRunToken,
  verifySessionToken
} from "@/lib/tokens";

beforeEach(() => {
  process.env.AUTH_SECRET = "test-auth-secret";
  process.env.LESSON_TOKEN_SECRET = "test-lesson-secret";
});

describe("session tokens", () => {
  it("creates and verifies session token", () => {
    const token = createSessionToken("u1", "user@example.com");
    const payload = verifySessionToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("u1");
    expect(payload?.email).toBe("user@example.com");
  });

  it("rejects malformed session token", () => {
    expect(verifySessionToken("invalid-token")).toBeNull();
  });
});

describe("lesson run tokens", () => {
  it("creates and verifies lesson token", () => {
    const { token } = createLessonRunToken("u1", "r1");
    const payload = verifyLessonRunToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("u1");
    expect(payload?.runId).toBe("r1");
  });
});
