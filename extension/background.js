const runState = {
  lessonRunToken: null,
  apiBaseUrl: null,
  runId: null,
  connectedAt: null
};

const DEFAULT_API_BASE_URL = "http://localhost:3000";

function resolveSenderOrigin(sender) {
  const senderUrl = sender?.url || sender?.tab?.url;
  if (typeof senderUrl !== "string" || !senderUrl.trim()) {
    return null;
  }

  try {
    return new URL(senderUrl).origin;
  } catch {
    return null;
  }
}

async function connectLessonRun(lessonRunToken, sender) {
  if (!lessonRunToken) {
    throw new Error("Missing lesson run token");
  }

  runState.lessonRunToken = lessonRunToken;
  runState.apiBaseUrl = resolveSenderOrigin(sender) || DEFAULT_API_BASE_URL;

  const payload = await apiRequest("/api/extension/connect", {
    method: "POST"
  });

  runState.runId = payload.runId;
  runState.connectedAt = new Date().toISOString();

  await chrome.storage.local.set({
    runState: {
      runId: runState.runId,
      connectedAt: runState.connectedAt
    }
  });

  await pushStateToGeminiTabs(payload.state);
  return payload;
}

async function apiRequest(path, options = {}) {
  if (!runState.lessonRunToken || !runState.apiBaseUrl) {
    throw new Error("Extension is not connected to a lesson run");
  }

  const response = await fetch(`${runState.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${runState.lessonRunToken}`,
      "Content-Type": "application/json"
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.message || "API request failed");
  }

  return payload;
}

async function pushStateToGeminiTabs(state) {
  const tabs = await chrome.tabs.query({ url: ["https://gemini.google.com/*"] });
  for (const tab of tabs) {
    if (!tab.id) continue;
    chrome.tabs.sendMessage(tab.id, {
      type: "RUN_STATE",
      state
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse({ ok: false, error: "Invalid message" });
    return;
  }

  if (message.type === "CONTENT_READY") {
    (async () => {
      try {
        if (!runState.lessonRunToken) {
          sendResponse({ ok: true, connected: false });
          return;
        }

        const state = await apiRequest("/api/extension/run-state", { method: "GET" });
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, { type: "RUN_STATE", state });
        }

        sendResponse({ ok: true, connected: true });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    })();

    return true;
  }

  if (message.type === "CONNECT_LESSON_FROM_WEB") {
    (async () => {
      try {
        const payload = await connectLessonRun(message.lessonRunToken, sender);
        sendResponse({
          ok: true,
          runId: payload.runId,
          expiresAt: payload.expiresAt
        });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : "Connect failed" });
      }
    })();

    return true;
  }

  if (message.type === "STEP_EVENT") {
    (async () => {
      try {
        if (!runState.lessonRunToken || !runState.runId) {
          sendResponse({ ok: false, error: "No active run" });
          return;
        }

        const payload = await apiRequest(`/api/lesson-runs/${runState.runId}/events`, {
          method: "POST",
          body: JSON.stringify({
            stepId: message.stepId,
            eventType: message.eventType,
            url: message.url,
            timestamp: message.timestamp,
            meta: message.meta
          })
        });

        await pushStateToGeminiTabs(payload.state);
        sendResponse({ ok: true, advanced: payload.advanced });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    })();

    return true;
  }

  if (message.type === "POPUP_STATUS") {
    sendResponse({
      ok: true,
      connected: Boolean(runState.lessonRunToken),
      runId: runState.runId,
      connectedAt: runState.connectedAt
    });
  }
});
