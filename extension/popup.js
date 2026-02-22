const statusEl = document.getElementById("status");
const runEl = document.getElementById("run");

chrome.runtime.sendMessage({ type: "POPUP_STATUS" }, (response) => {
  if (!response || !response.ok) {
    statusEl.textContent = "Unable to read extension status";
    return;
  }

  if (!response.connected) {
    statusEl.textContent = "No active lesson run";
    return;
  }

  statusEl.textContent = "Connected to lesson run";
  runEl.textContent = `Run: ${response.runId || "unknown"}`;
});
