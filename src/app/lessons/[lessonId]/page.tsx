"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const WEB_BRIDGE_SOURCE = "AI_COACH_WEB_APP";
const EXTENSION_BRIDGE_SOURCE = "AI_COACH_EXTENSION_BRIDGE";

type LessonStep = {
  id: string;
  order: number;
  instruction: string;
  actionType: string;
  completionRule: string;
  allowManualConfirm: boolean;
};

type LessonData = {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
};

type RunState = {
  runId: string;
  lessonId: string;
  lessonTitle: string;
  status: "IN_PROGRESS" | "COMPLETED";
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
    status: "LOCKED" | "ACTIVE" | "COMPLETED";
    instruction: string;
  }>;
};

async function sendExtensionMessage(payload: {
  type: "CONNECT_LESSON";
  lessonRunToken: string;
}): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const requestId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({
        ok: false,
        error: "Extension bridge not found. Reload the extension and refresh this page."
      });
    }, 2500);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
    }

    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;
      const message = event.data as
        | {
            source?: string;
            type?: string;
            requestId?: string;
            ok?: boolean;
            error?: string;
          }
        | undefined;

      if (!message) return;
      if (message.source !== EXTENSION_BRIDGE_SOURCE) return;
      if (message.type !== "CONNECT_LESSON_RESULT") return;
      if (message.requestId !== requestId) return;

      cleanup();
      resolve({ ok: Boolean(message.ok), error: message.error });
    }

    window.addEventListener("message", handleMessage);
    window.postMessage(
      {
        source: WEB_BRIDGE_SOURCE,
        type: "CONNECT_LESSON",
        requestId,
        payload
      },
      "*"
    );
  });
}

const TOOL_CONFIG: Record<string, { name: string; url: string; icon: string; color: string }> = {
  gemini: { name: "Google Gemini", url: "https://gemini.google.com", icon: "✦", color: "#4285F4" },
  chatgpt: { name: "ChatGPT", url: "https://chatgpt.com", icon: "⬡", color: "#10a37f" },
  notebooklm: { name: "NotebookLM", url: "https://notebooklm.google.com", icon: "📓", color: "#1967D2" },
};

function getToolSlug(lessonId: string): string {
  const prefix = lessonId.split("-")[0];
  return TOOL_CONFIG[prefix] ? prefix : "gemini";
}

export default function LessonRunnerPage({ params }: { params: { lessonId: string } }) {
  const lessonId = params.lessonId;
  const toolSlug = getToolSlug(lessonId);
  const toolInfo = TOOL_CONFIG[toolSlug] ?? TOOL_CONFIG.gemini;
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runToken, setRunToken] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ text: string; type: "default" | "active" | "success" | "error" }>({
    text: "Install the extension, then click Start Lesson to begin.",
    type: "default"
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLesson() {
      const response = await apiFetch(`/api/tools/${toolSlug}/lessons`);
      const payload = (await response.json().catch(() => ({}))) as {
        lessons?: LessonData[];
        error?: string;
      };

      if (!active) return;

      if (!response.ok) {
        setError(payload.error ?? "Failed to load lesson");
        return;
      }

      const selected = (payload.lessons ?? []).find((item) => item.id === lessonId) ?? null;
      if (!selected) {
        setError("Lesson not found");
        return;
      }

      setLesson(selected);
    }

    void loadLesson();

    return () => {
      active = false;
    };
  }, [lessonId, toolSlug]);

  useEffect(() => {
    if (!runToken) {
      return;
    }

    let timeoutId: number;
    let active = true;

    async function pollState() {
      if (!active) return;

      try {
        const response = await apiFetch("/api/extension/run-state", {
          headers: {
            Authorization: `Bearer ${runToken}`
          }
        });

        const payload = (await response.json().catch(() => ({}))) as RunState & { error?: string };
        if (active) {
          if (!response.ok) {
            setError(payload.error ?? "Failed to refresh run state");
          } else {
            setRunState(payload);
          }
        }
      } catch (err) {
        if (active) {
           console.error("Polling error", err);
        }
      } finally {
        if (active) {
          timeoutId = window.setTimeout(pollState, 2000);
        }
      }
    }

    void pollState();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [runToken]);

  const orderedSteps = useMemo(() => {
    return [...(runState?.steps ?? [])].sort((a, b) => a.order - b.order);
  }, [runState]);

  // Compute progress
  const completedCount = orderedSteps.filter((s) => s.status === "COMPLETED").length;
  const totalCount = orderedSteps.length || lesson?.steps?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCompleted = runState?.status === "COMPLETED";
  const isRunning = runState?.status === "IN_PROGRESS";

  // Steps to show before start (from lesson data)
  const previewSteps = lesson?.steps
    ? [...lesson.steps].sort((a, b) => a.order - b.order)
    : [];

  async function startLesson() {
    const toolWindow = window.open("", "_blank");
    setBusy(true);
    setError(null);

    const response = await apiFetch("/api/lesson-runs/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      runId?: string;
      lessonRunToken?: string;
      state?: RunState;
    };

    if (!response.ok || !payload.runId || !payload.lessonRunToken) {
      setError(payload.error ?? "Failed to start lesson");
      if (toolWindow && !toolWindow.closed) {
        toolWindow.close();
      }
      setBusy(false);
      return;
    }

    setRunId(payload.runId);
    setRunToken(payload.lessonRunToken);
    setRunState(payload.state ?? null);

    if (toolWindow && !toolWindow.closed) {
      toolWindow.location.href = toolInfo.url;
    }

    const connectResponse = await sendExtensionMessage({
      type: "CONNECT_LESSON",
      lessonRunToken: payload.lessonRunToken
    });

    if (!connectResponse.ok) {
      setInfo({
        text: `Extension not connected: ${connectResponse.error ?? "unknown error"}. Reload extension and refresh.`,
        type: "error"
      });
    } else {
      setInfo({
        text: `Extension connected! Go to ${toolInfo.name} and follow the guided steps.`,
        type: "success"
      });
    }

    setBusy(false);
  }

  async function manualConfirm() {
    if (!runId || !runState?.currentStep) {
      return;
    }

    const response = await apiFetch(`/api/lesson-runs/${runId}/complete-step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: runState.currentStep.id })
    });

    const payload = (await response.json().catch(() => ({}))) as RunState & { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Unable to confirm step");
      return;
    }

    setRunState(payload);
    setError(null);
  }

  // Info bar icon
  const infoIcon = info.type === "success" ? "✅" : info.type === "error" ? "⚠️" : info.type === "active" ? "🔄" : "🔌";

  return (
    <main className="main-wrap">
      <Link href="/dashboard" className="back-to-course-btn">
        <span className="back-arrow">←</span> Back to course
      </Link>

      {/* ── Header with tool icon ── */}
      <div className="lesson-runner-header">
        <div
          className="lesson-tool-icon"
          style={{ background: `${toolInfo.color}15`, color: toolInfo.color }}
        >
          {toolInfo.icon}
        </div>
        <h1>{lesson?.title ?? "Loading..."}</h1>
      </div>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>{lesson?.description}</p>

      {/* ── Completed celebration ── */}
      {isCompleted ? (
        <div className="completion-panel" style={{ marginBottom: "1.5rem" }}>
          <span className="completion-emoji">🎉</span>
          <h2>Lesson Complete!</h2>
          <p>
            Great job! You&apos;ve completed all {totalCount} steps. Your badge has been awarded.
          </p>
          <Link href="/dashboard">
            <button className="primary">Back to Dashboard</button>
          </Link>
        </div>
      ) : null}

      {/* ── Control Panel ── */}
      <div className="panel" style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Info bar */}
        <div className={`info-bar info-${info.type}`}>
          <span className="info-icon">{infoIcon}</span>
          <span>{info.text}</span>
        </div>

        {/* Action buttons */}
        <div className="lesson-actions">
          {!isCompleted ? (
            <button className="primary" onClick={startLesson} disabled={busy || !lesson}>
              {busy ? "⏳ Starting..." : isRunning ? "🔄 Restart Lesson" : "▶ Start Lesson"}
            </button>
          ) : null}
          <a href={toolInfo.url} target="_blank" rel="noreferrer">
            <button>
              Open {toolInfo.name} ↗
            </button>
          </a>
          {runState?.currentStep?.allowManualConfirm ? (
            <button onClick={manualConfirm} className="small">
              ✓ Mark Step Complete
            </button>
          ) : null}
        </div>

        {/* Error message */}
        {error ? (
          <div className="info-bar info-error">
            <span className="info-icon">⚠️</span>
            <span>
              {error}
              {error.includes("Consent") ? (
                <>
                  {" "}
                  <Link href="/consent" style={{ textDecoration: "underline", fontWeight: "bold" }}>
                    Review Policy
                  </Link>
                </>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Progress bar (when running) ── */}
      {(isRunning || isCompleted) && totalCount > 0 ? (
        <div className="panel" style={{ marginBottom: "1.5rem", padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Progress
            </span>
            <span className="progress-text">
              {completedCount}/{totalCount} steps
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      ) : null}

      {/* ── Current step highlight (when running) ── */}
      {isRunning && runState?.currentStep ? (
        <div className="current-step-card" style={{ marginBottom: "1.5rem" }}>
          <span className="current-step-label">Now</span>
          <span className="current-step-text">
            Step {runState.currentStep.order}: {runState.currentStep.instruction}
          </span>
        </div>
      ) : null}

      {/* ── Step timeline ── */}
      <section className="panel" style={{ display: "grid", gap: "0.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem" }}>
          {isRunning ? "Lesson Steps" : isCompleted ? "Completed Steps" : "What You'll Learn"}
        </h3>

        {/* Show run steps if running/completed, otherwise show preview */}
        {orderedSteps.length > 0 ? (
          <div className="step-timeline">
            {orderedSteps.map((step, idx) => {
              const isLast = idx === orderedSteps.length - 1;
              const circleClass =
                step.status === "COMPLETED"
                  ? "step-completed"
                  : step.status === "ACTIVE"
                    ? "step-active"
                    : "step-locked";
              const instructionClass =
                step.status === "COMPLETED"
                  ? "instruction-done"
                  : step.status === "ACTIVE"
                    ? "instruction-active"
                    : "instruction-muted";
              const labelClass =
                step.status === "COMPLETED"
                  ? "label-completed"
                  : step.status === "ACTIVE"
                    ? "label-active"
                    : "label-locked";
              const labelIcon =
                step.status === "COMPLETED" ? "✓" : step.status === "ACTIVE" ? "●" : "🔒";
              const labelText =
                step.status === "COMPLETED"
                  ? "Completed"
                  : step.status === "ACTIVE"
                    ? "In Progress"
                    : "Locked";

              return (
                <div className="step-timeline-item" key={step.stepId}>
                  <div className="step-timeline-track">
                    <div className={`step-circle ${circleClass}`}>
                      {step.status === "COMPLETED" ? "✓" : step.order}
                    </div>
                    {!isLast ? (
                      <div className={`step-line ${step.status === "COMPLETED" ? "line-done" : "line-pending"}`} />
                    ) : null}
                  </div>
                  <div className="step-content">
                    <div className={`step-instruction ${instructionClass}`}>
                      {step.instruction}
                    </div>
                    <div className={`step-status-label ${labelClass}`}>
                      {labelIcon} {labelText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : previewSteps.length > 0 ? (
          <div className="step-timeline">
            {previewSteps.map((step, idx) => {
              const isLast = idx === previewSteps.length - 1;
              return (
                <div className="step-timeline-item" key={step.id}>
                  <div className="step-timeline-track">
                    <div className="step-circle step-locked">{step.order}</div>
                    {!isLast ? <div className="step-line line-pending" /> : null}
                  </div>
                  <div className="step-content">
                    <div className="step-instruction instruction-muted">
                      {step.instruction}
                    </div>
                    <div className="step-status-label label-locked">
                      🔒 Not started
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">Loading steps...</p>
        )}
      </section>
    </main>
  );
}
