import { CompletionRule, InputLengthBucket, TelemetryEventType } from "@/types/lesson";

export function bucketInputLength(length: number): InputLengthBucket {
  if (length <= 0) return "0";
  if (length <= 20) return "1-20";
  if (length <= 100) return "21-100";
  return "100+";
}

export function isCompletionRuleSatisfied(rule: CompletionRule, eventType: TelemetryEventType): boolean {
  switch (rule) {
    case "element_visible":
      return eventType === "ELEMENT_FOUND";
    case "clicked_target":
      return eventType === "CLICK";
    case "input_detected":
      return eventType === "INPUT_ACTIVITY";
    case "response_detected":
      return eventType === "RESPONSE_VISIBLE";
    default:
      return false;
  }
}

export function findFirstMatchingSelector(selectors: string[]): { selector: string; element: Element } | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return { selector, element };
    }
  }
  return null;
}
