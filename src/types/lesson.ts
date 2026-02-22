export type ToolSlug = string;

export type LessonDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type LessonActionType = "navigate" | "click" | "input" | "wait_for_response";
export type CompletionRule =
  | "element_visible"
  | "clicked_target"
  | "input_detected"
  | "response_detected";

export type LessonStepSeed = {
  id: string;
  order: number;
  instruction: string;
  coachText?: string;
  urlPattern: string;
  targetSelectors: string[];
  actionType: LessonActionType;
  completionRule: CompletionRule;
  allowManualConfirm: boolean;
};

export type LessonSeed = {
  id: string;
  tool: ToolSlug;
  title: string;
  description: string;
  difficulty?: LessonDifficulty;
  category?: string;
  estimatedMinutes?: number;
  steps: LessonStepSeed[];
};

export type ToolSeed = {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
};

export type TelemetryEventType = "ELEMENT_FOUND" | "CLICK" | "INPUT_ACTIVITY" | "RESPONSE_VISIBLE";

export type InputLengthBucket = "0" | "1-20" | "21-100" | "100+";

export type StepDetectedEvent = {
  runId: string;
  stepId: string;
  eventType: TelemetryEventType;
  url: string;
  timestamp: string;
  meta?: {
    selectorId?: string;
    inputLengthBucket?: InputLengthBucket;
  };
};

