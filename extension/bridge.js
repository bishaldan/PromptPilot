const WEB_SOURCE = "AI_COACH_WEB_APP";
const EXTENSION_SOURCE = "AI_COACH_EXTENSION_BRIDGE";

function postBridgeResponse(requestId, ok, error, data) {
  window.postMessage(
    {
      source: EXTENSION_SOURCE,
      type: "CONNECT_LESSON_RESULT",
      requestId,
      ok,
      error,
      data
    },
    "*"
  );
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const message = event.data;
  if (!message || message.source !== WEB_SOURCE || message.type !== "CONNECT_LESSON") return;

  chrome.runtime.sendMessage(
    {
      type: "CONNECT_LESSON_FROM_WEB",
      lessonRunToken: message.payload?.lessonRunToken
    },
    (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError?.message) {
        postBridgeResponse(message.requestId, false, runtimeError.message);
        return;
      }

      if (!response || typeof response !== "object") {
        postBridgeResponse(message.requestId, false, "No response from extension background");
        return;
      }

      postBridgeResponse(message.requestId, Boolean(response.ok), response.error, response);
    }
  );
});
