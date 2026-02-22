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

export default function LessonRunnerPage({ params }: { params: { lessonId: string } }) {
  const lessonId = params.lessonId;
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runToken, setRunToken] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>("Install extension, then click Start lesson.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLesson() {
      const response = await apiFetch("/api/tools/gemini/lessons");
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
  }, [lessonId]);

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

  async function startLesson() {
    const geminiWindow = window.open("", "_blank");
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
      if (geminiWindow && !geminiWindow.closed) {
        geminiWindow.close();
      }
      setBusy(false);
      return;
    }

    setRunId(payload.runId);
    setRunToken(payload.lessonRunToken);
    setRunState(payload.state ?? null);

    if (geminiWindow && !geminiWindow.closed) {
      geminiWindow.location.href = "https://gemini.google.com";
    }

    const connectResponse = await sendExtensionMessage({
      type: "CONNECT_LESSON",
      lessonRunToken: payload.lessonRunToken
    });

    if (!connectResponse.ok) {
      setInfo(
        `Run started, but extension did not connect: ${connectResponse.error ?? "unknown error"} ` +
          "Reload extension, refresh this page, then press Start lesson again."
      );
    } else {
      setInfo("Extension connected. Open Gemini and follow the highlighted target.");
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

  return (
    <main className="main-wrap">
      <Link href="/dashboard" className="muted">
        Back to dashboard
      </Link>

      <h1>{lesson?.title ?? "Lesson"}</h1>
      <p className="muted">{lesson?.description}</p>

      <div className="panel" style={{ display: "grid", gap: "0.7rem", marginBottom: "1rem" }}>
        <p>{info}</p>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <button className="primary" onClick={startLesson} disabled={busy || !lesson}>
            {busy ? "Starting..." : "Start lesson"}
          </button>
          <a href="https://gemini.google.com" target="_blank" rel="noreferrer">
            <button>Open Gemini</button>
          </a>
          {runState?.currentStep?.allowManualConfirm ? (
            <button onClick={manualConfirm}>Manual confirm current step</button>
          ) : null}
        </div>
        {runId ? <p className="muted">Run ID: {runId}</p> : null}
        {error ? <p className="status-warn">{error}</p> : null}
      </div>

      <section className="panel" style={{ display: "grid", gap: "0.65rem" }}>
        <h3 style={{ margin: 0 }}>Run status: {runState?.status ?? "Not started"}</h3>
        {runState?.currentStep ? (
          <p>
            <strong>Current step:</strong> {runState.currentStep.order}. {runState.currentStep.instruction}
          </p>
        ) : runState?.status === "COMPLETED" ? (
          <p className="status-ok">Lesson completed. Badge awarded.</p>
        ) : (
          <p className="muted">No active step yet.</p>
        )}

        <div className="card-list">
          {orderedSteps.map((step) => (
            <article className="step-item" key={step.stepId}>
              <strong>
                {step.order}. {step.instruction}
              </strong>
              <div className="muted">Status: {step.status}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
