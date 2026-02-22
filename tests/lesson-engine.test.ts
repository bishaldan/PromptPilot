import { describe, expect, it } from "vitest";
import { bucketInputLength, isCompletionRuleSatisfied } from "@/lib/lesson-engine";

describe("bucketInputLength", () => {
  it("maps 0 chars to bucket 0", () => {
    expect(bucketInputLength(0)).toBe("0");
  });

  it("maps short strings to 1-20", () => {
    expect(bucketInputLength(7)).toBe("1-20");
  });

  it("maps medium strings to 21-100", () => {
    expect(bucketInputLength(42)).toBe("21-100");
  });

  it("maps long strings to 100+", () => {
    expect(bucketInputLength(101)).toBe("100+");
  });
});

describe("isCompletionRuleSatisfied", () => {
  it("validates click rule", () => {
    expect(isCompletionRuleSatisfied("clicked_target", "CLICK")).toBe(true);
    expect(isCompletionRuleSatisfied("clicked_target", "INPUT_ACTIVITY")).toBe(false);
  });

  it("validates response rule", () => {
    expect(isCompletionRuleSatisfied("response_detected", "RESPONSE_VISIBLE")).toBe(true);
    expect(isCompletionRuleSatisfied("response_detected", "ELEMENT_FOUND")).toBe(false);
  });
});
