import { LessonRunStatus, LessonRunStepStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isCompletionRuleSatisfied } from "@/lib/lesson-engine";
import { StepDetectedEvent } from "@/types/lesson";

type RunWithRelations = Prisma.LessonRunGetPayload<{
  include: {
    lesson: {
      include: {
        steps: {
          orderBy: {
            stepOrder: "asc";
          };
        };
      };
    };
    steps: {
      include: {
        lessonStep: true;
      };
      orderBy: {
        lessonStep: {
          stepOrder: "asc";
        };
      };
    };
  };
}>;

export type SerializedRunState = {
  runId: string;
  lessonId: string;
  lessonTitle: string;
  status: LessonRunStatus;
  currentStep: null | {
    id: string;
    order: number;
    instruction: string;
    coachText?: string;
    actionType: string;
    completionRule: string;
    allowManualConfirm: boolean;
    targetSelectors: string[];
    urlPattern: string;
  };
  steps: Array<{
    stepId: string;
    order: number;
    status: LessonRunStepStatus;
    instruction: string;
  }>;
};

function toRunState(run: RunWithRelations): SerializedRunState {
  const activeStep = run.steps.find((step) => step.status === LessonRunStepStatus.ACTIVE);
  const activeStepConfig = (activeStep?.lessonStep.configJson ?? {}) as { coachText?: string | null };

  return {
    runId: run.id,
    lessonId: run.lessonId,
    lessonTitle: run.lesson.title,
    status: run.status,
    currentStep: activeStep
      ? {
          id: activeStep.lessonStep.id,
          order: activeStep.lessonStep.stepOrder,
          instruction: activeStep.lessonStep.instruction,
          coachText: activeStepConfig.coachText ?? undefined,
          actionType: activeStep.lessonStep.actionType,
          completionRule: activeStep.lessonStep.completionRule,
          allowManualConfirm: activeStep.lessonStep.allowManualConfirm,
          targetSelectors: activeStep.lessonStep.targetSelectors as string[],
          urlPattern: activeStep.lessonStep.urlPattern
        }
      : null,
    steps: run.steps.map((step) => ({
      stepId: step.lessonStep.id,
      order: step.lessonStep.stepOrder,
      status: step.status,
      instruction: step.lessonStep.instruction
    }))
  };
}

export async function getRunState(runId: string): Promise<SerializedRunState | null> {
  const run = await prisma.lessonRun.findUnique({
    where: { id: runId },
    include: {
      lesson: {
        include: {
          steps: {
            orderBy: { stepOrder: "asc" }
          }
        }
      },
      steps: {
        include: { lessonStep: true },
        orderBy: {
          lessonStep: {
            stepOrder: "asc"
          }
        }
      }
    }
  });

  if (!run) {
    return null;
  }

  return toRunState(run);
}

export async function markManualCompletion(runId: string, stepId: string): Promise<SerializedRunState | null> {
  const run = await prisma.lessonRun.findUnique({
    where: { id: runId },
    include: {
      lesson: {
        include: {
          steps: { orderBy: { stepOrder: "asc" } }
        }
      },
      steps: {
        include: { lessonStep: true },
        orderBy: {
          lessonStep: {
            stepOrder: "asc"
          }
        }
      }
    }
  });

  if (!run || run.status === LessonRunStatus.COMPLETED) {
    return run ? toRunState(run) : null;
  }

  const activeStep = run.steps.find((step) => step.status === LessonRunStepStatus.ACTIVE);
  if (!activeStep || activeStep.lessonStep.id !== stepId || !activeStep.lessonStep.allowManualConfirm) {
    return toRunState(run);
  }

  await completeActiveStepTransition(run.id, run.userId, run.lessonId, activeStep.lessonStep.stepOrder);
  const latest = await getRunState(run.id);
  return latest;
}

async function completeActiveStepTransition(
  runId: string,
  userId: string,
  lessonId: string,
  completedOrder: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const activeRunStep = await tx.lessonRunStep.findFirst({
      where: {
        runId,
        lessonStep: {
          stepOrder: completedOrder
        }
      },
      include: {
        lessonStep: true
      }
    });

    if (!activeRunStep || activeRunStep.status !== LessonRunStepStatus.ACTIVE) {
      return;
    }

    await tx.lessonRunStep.update({
      where: { id: activeRunStep.id },
      data: { status: LessonRunStepStatus.COMPLETED, completedAt: new Date() }
    });

    const nextRunStep = await tx.lessonRunStep.findFirst({
      where: {
        runId,
        status: LessonRunStepStatus.LOCKED
      },
      include: {
        lessonStep: true
      },
      orderBy: {
        lessonStep: {
          stepOrder: "asc"
        }
      }
    });

    if (!nextRunStep) {
      await tx.lessonRun.update({
        where: { id: runId },
        data: { status: LessonRunStatus.COMPLETED, completedAt: new Date() }
      });

      await tx.badgeAward.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        update: {},
        create: {
          userId,
          lessonId
        }
      });

      return;
    }

    await tx.lessonRunStep.update({
      where: { id: nextRunStep.id },
      data: {
        status: LessonRunStepStatus.ACTIVE,
        startedAt: new Date()
      }
    });
  });
}

export async function processTelemetryEvent(
  runId: string,
  event: Omit<StepDetectedEvent, "runId">
): Promise<{ state: SerializedRunState | null; advanced: boolean; reason?: string }> {
  const run = await prisma.lessonRun.findUnique({
    where: { id: runId },
    include: {
      lesson: {
        include: {
          steps: { orderBy: { stepOrder: "asc" } }
        }
      },
      steps: {
        include: { lessonStep: true },
        orderBy: {
          lessonStep: {
            stepOrder: "asc"
          }
        }
      }
    }
  });

  if (!run) {
    return { state: null, advanced: false, reason: "Run not found" };
  }

  if (run.status === LessonRunStatus.COMPLETED) {
    return { state: toRunState(run), advanced: false, reason: "Run already completed" };
  }

  const activeStep = run.steps.find((step) => step.status === LessonRunStepStatus.ACTIVE);
  if (!activeStep) {
    return { state: toRunState(run), advanced: false, reason: "No active step" };
  }

  if (event.stepId !== activeStep.lessonStep.id) {
    return { state: toRunState(run), advanced: false, reason: "Step out of order" };
  }

  const rule = activeStep.lessonStep.completionRule as
    | "element_visible"
    | "clicked_target"
    | "input_detected"
    | "response_detected";

  const matches = isCompletionRuleSatisfied(rule, event.eventType);

  if (!matches) {
    return { state: toRunState(run), advanced: false, reason: "Event does not satisfy completion rule" };
  }

  await completeActiveStepTransition(run.id, run.userId, run.lessonId, activeStep.lessonStep.stepOrder);
  const latest = await getRunState(run.id);
  return { state: latest, advanced: true };
}
