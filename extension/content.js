let activeRunState = null;
let highlightedElement = null;
let observer = null;
let lastSignalKey = null;
let connectorLine = null;
let calloutBox = null;
let calloutArrow = null;
let calloutTitle = null;
let calloutBody = null;
let calloutMeta = null;
let lastCalloutSelector = null;
let layoutRaf = null;
const COACH_UI_ATTR = "data-ai-coach-ui";

function clearHighlight() {
  if (!highlightedElement) return;
  highlightedElement.style.outline = "";
  highlightedElement.style.outlineOffset = "";
  highlightedElement = null;
}

function clearConnector() {
  if (!connectorLine) return;
  connectorLine.remove();
  connectorLine = null;
}

function clearCallout() {
  lastCalloutSelector = null;
  if (calloutBox) {
    calloutBox.remove();
  }
  calloutBox = null;
  calloutArrow = null;
  calloutTitle = null;
  calloutBody = null;
  calloutMeta = null;
  clearConnector();
}

function isCoachUiElement(element) {
  if (!(element instanceof Element)) return false;
  return Boolean(element.closest(`[${COACH_UI_ATTR}='true']`));
}

function ensureCalloutElements() {
  if (!calloutBox) {
    calloutBox = document.createElement("div");
    calloutBox.setAttribute(COACH_UI_ATTR, "true");
    calloutBox.setAttribute("popover", "manual"); // Enforce Top Layer
    calloutBox.style.margin = "0"; // Reset popover default margin
    calloutBox.style.position = "fixed";
    calloutBox.style.width = "340px";
    calloutBox.style.maxWidth = "380px";
    calloutBox.style.background = "linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92))";
    calloutBox.style.backdropFilter = "blur(16px)";
    calloutBox.style.border = "1px solid rgba(139, 92, 246, 0.3)";
    calloutBox.style.borderRadius = "16px";
    calloutBox.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06) inset, 0 1px 0 rgba(255, 255, 255, 0.08) inset";
    calloutBox.style.padding = "0";
    calloutBox.style.overflow = "hidden";
    calloutBox.style.setProperty("z-index", "2147483647", "important");
    calloutBox.style.color = "#f8fafc";
    calloutBox.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    calloutBox.style.pointerEvents = "none";
    calloutBox.style.setProperty("transition", "all 0.3s ease", "important");
    calloutBox.style.animation = "fadeInCoach 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

    // Add custom animation to document if it doesn't exist
    if (!document.getElementById('coach-animations')) {
      const style = document.createElement('style');
      style.id = 'coach-animations';
      style.textContent = `
        @keyframes fadeInCoach {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
      `;
      document.head.appendChild(style);
    }

    // Gradient accent bar at top
    const accentBar = document.createElement("div");
    accentBar.style.height = "3px";
    accentBar.style.background = "linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4)";
    accentBar.style.width = "100%";
    calloutBox.appendChild(accentBar);

    // Inner content wrapper
    const innerWrap = document.createElement("div");
    innerWrap.style.padding = "14px 16px 12px";
    calloutBox.appendChild(innerWrap);

    calloutArrow = document.createElement("div");
    calloutArrow.style.position = "absolute";
    calloutArrow.style.width = "0";
    calloutArrow.style.height = "0";
    calloutBox.appendChild(calloutArrow);

    calloutTitle = document.createElement("div");
    calloutTitle.style.fontSize = "13.5px";
    calloutTitle.style.fontWeight = "700";
    calloutTitle.style.marginBottom = "8px";
    calloutTitle.style.color = "#ffffff";
    calloutTitle.style.lineHeight = "1.4";
    innerWrap.appendChild(calloutTitle);

    calloutBody = document.createElement("div");
    calloutBody.style.fontSize = "12.5px";
    calloutBody.style.lineHeight = "1.6";
    calloutBody.style.marginBottom = "10px";
    calloutBody.style.color = "#cbd5e1";
    innerWrap.appendChild(calloutBody);

    calloutMeta = document.createElement("div");
    calloutMeta.style.fontSize = "11px";
    calloutMeta.style.color = "#a78bfa";
    calloutMeta.style.fontWeight = "600";
    calloutMeta.style.letterSpacing = "0.03em";
    calloutMeta.style.display = "flex";
    calloutMeta.style.alignItems = "center";
    calloutMeta.style.gap = "6px";
    innerWrap.appendChild(calloutMeta);

    document.body.appendChild(calloutBox);
    try { calloutBox.showPopover(); } catch(e) {} // Show in Top Layer
  }

  if (!connectorLine) {
    connectorLine = document.createElement("div");
    connectorLine.setAttribute(COACH_UI_ATTR, "true");
    connectorLine.setAttribute("popover", "manual"); // Enforce Top Layer
    connectorLine.style.margin = "0"; // Reset popover default margin
    connectorLine.style.position = "fixed";
    connectorLine.style.height = "2px";
    connectorLine.style.background = "linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(59, 130, 246, 0.8))";
    connectorLine.style.transformOrigin = "0 50%";
    connectorLine.style.pointerEvents = "none";
    connectorLine.style.setProperty("z-index", "2147483646", "important");
    connectorLine.style.boxShadow = "0 0 8px rgba(139, 92, 246, 0.5)";
    
    document.body.appendChild(connectorLine);
    try { connectorLine.showPopover(); } catch(e) {} // Show in Top Layer
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function describeStep(step, selector) {
  if (step.coachText && String(step.coachText).trim()) {
    return String(step.coachText).trim();
  }

  const normalized = (selector || "").toLowerCase();
  const isChatGPT = window.location.hostname.includes("chatgpt.com");
  const isNotebookLM = window.location.hostname.includes("notebooklm.google.com");
  const toolName = isChatGPT ? "ChatGPT" : isNotebookLM ? "NotebookLM" : "Gemini";

  if (
    normalized.includes("textarea") ||
    normalized.includes("contenteditable") ||
    normalized.includes("textbox") ||
    normalized.includes("prompt-textarea")
  ) {
    return `This is the prompt input area. Click here and type your instruction for ${toolName}.`;
  }

  if (step.completionRule === "response_detected") {
    return `This section displays ${toolName} responses. Wait until a new response appears.`;
  }

  if (step.completionRule === "clicked_target") {
    return "Click this highlighted area to continue to the next guided step.";
  }

  if (step.completionRule === "element_visible") {
    return "The system is checking that this required part of the interface is visible.";
  }

  return "Follow this highlighted section to complete the current training step.";
}

function isElementVisible(element) {
  if (!(element instanceof Element)) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }

  const center = centerPoint(rect);
  const topAtCenter = document.elementFromPoint(center.x, center.y);
  if (!topAtCenter) return false;

  if (!element.contains(topAtCenter) && !topAtCenter.contains(element)) {
    return false;
  }

  return true;
}

function findElementByText(textToken) {
  const query = textToken.trim().toLowerCase();
  if (!query) return null;

  const candidates = document.querySelectorAll(
    "button,[role='button'],[role='menuitem'],[role='option'],div,span,a,li,p,h1,h2,h3"
  );

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (isCoachUiElement(candidate)) continue;
    if (!isElementVisible(candidate)) continue;

    const combinedText = `${candidate.getAttribute("aria-label") || ""} ${candidate.textContent || ""}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!combinedText.includes(query)) continue;

    const rect = candidate.getBoundingClientRect();
    const area = rect.width * rect.height;
    const viewportArea = window.innerWidth * window.innerHeight;
    if (area > viewportArea * 0.35) continue;

    let score = area;
    if (!isButtonLike(candidate)) {
      score += 50_000;
    }
    if (combinedText === query) {
      score -= 20_000;
    }

    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

function collectVisibleTextMatches(textTokens) {
  const seen = new Set();
  const matches = [];

  for (const token of textTokens) {
    const element = findElementByText(token);
    if (!element || seen.has(element)) continue;
    seen.add(element);
    matches.push({ token, element });
  }

  return matches;
}

function isLikelyPopupElement(element) {
  if (!(element instanceof Element)) return false;

  if (element.closest("[role='menu'],[role='listbox'],[role='dialog'],[aria-modal='true']")) {
    return true;
  }

  const style = window.getComputedStyle(element);
  if (style.position === "fixed" || style.position === "absolute") {
    return true;
  }

  if (element.parentElement) {
    const parentStyle = window.getComputedStyle(element.parentElement);
    if (parentStyle.position === "fixed" || parentStyle.position === "absolute") {
      return true;
    }
  }

  return false;
}

function pickClosestToAnchor(matches, anchorElement) {
  if (!matches.length) return null;
  if (!(anchorElement instanceof Element)) return matches[0].element;

  const anchorRect = anchorElement.getBoundingClientRect();
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const match of matches) {
    const rect = match.element.getBoundingClientRect();
    const score = elementCenterDistance(rect, anchorRect);
    if (score < bestScore) {
      bestScore = score;
      best = match.element;
    }
  }

  return best || matches[0].element;
}

function findPopupMatchByTextCandidates(textTokens, anchorElement) {
  const matches = collectVisibleTextMatches(textTokens);
  if (!matches.length) return null;

  const popupMatches = matches.filter((match) => {
    if (!isLikelyPopupElement(match.element)) {
      return false;
    }

    if (!(anchorElement instanceof Element)) {
      return true;
    }

    const rect = match.element.getBoundingClientRect();
    const anchorRect = anchorElement.getBoundingClientRect();
    const horizontalGap = Math.abs(rect.left + rect.width / 2 - (anchorRect.left + anchorRect.width / 2));
    const verticalGap = Math.abs(rect.top + rect.height / 2 - (anchorRect.top + anchorRect.height / 2));
    return horizontalGap <= window.innerWidth * 0.45 && verticalGap <= window.innerHeight * 0.45;
  });

  if (!popupMatches.length) return null;
  return pickClosestToAnchor(popupMatches, anchorElement);
}

function isButtonLike(element) {
  if (!(element instanceof Element)) return false;
  const role = element.getAttribute("role");
  return element.tagName.toLowerCase() === "button" || role === "button";
}

function elementText(element) {
  if (!(element instanceof Element)) return "";
  return `${element.getAttribute("aria-label") || ""} ${element.textContent || ""}`
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findPromptInputElement() {
  const selectors = ["textarea", "div[contenteditable='true']", "[role='textbox']"];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  }
  return null;
}

function centerPoint(rect) {
  return {
    x: Math.min(Math.max(rect.left + rect.width / 2, 1), window.innerWidth - 1),
    y: Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1)
  };
}

function elementCenterDistance(aRect, bRect) {
  const ax = aRect.left + aRect.width / 2;
  const ay = aRect.top + aRect.height / 2;
  const bx = bRect.left + bRect.width / 2;
  const by = bRect.top + bRect.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

function findGeminiToolsButton() {
  const directCandidates = [
    "button[aria-label*='Tools' i]",
    "[role='button'][aria-label*='Tools' i]",
    "button[aria-label*='tool' i]"
  ];

  for (const selector of directCandidates) {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  }

  const buttonCandidates = Array.from(document.querySelectorAll("button,[role='button']")).filter(
    (candidate) => isElementVisible(candidate) && elementText(candidate).includes("tools")
  );

  if (buttonCandidates.length === 0) return null;

  const input = findPromptInputElement();
  if (!input) return buttonCandidates[0];

  const inputRect = input.getBoundingClientRect();
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of buttonCandidates) {
    const rect = candidate.getBoundingClientRect();
    const distance = elementCenterDistance(rect, inputRect);
    if (distance < bestScore) {
      bestScore = distance;
      best = candidate;
    }
  }

  return best || buttonCandidates[0];
}

function findGeminiToolsMenuItem() {
  const candidates = ["Create image", "Create video", "Canvas", "Deep research"];
  const toolsButton = findGeminiToolsButton();
  return findPopupMatchByTextCandidates(candidates, toolsButton);
}

function findGeminiToolsMenuItemByName(name) {
  const toolsButton = findGeminiToolsButton();
  return findPopupMatchByTextCandidates([name], toolsButton);
}

function findGeminiModelMenuItem() {
  const candidates = ["Fast", "Thinking", "Advanced math and code"];
  const modelButton = resolveSelector("special=gemini-model-selector");
  return findPopupMatchByTextCandidates(candidates, modelButton);
}

function findGeminiAddFileButton() {
  const directCandidates = [
    "button[aria-label*='Add file' i]",
    "button[aria-label*='Add files' i]",
    "button[aria-label*='files and more' i]",
    "button[aria-label*='Upload' i]",
    "button[aria-label*='upload file' i]",
    "[role='button'][aria-label*='Add file' i]",
    "[role='button'][aria-label*='Add files' i]",
    "[role='button'][aria-label*='files and more' i]",
    "[role='button'][aria-label*='upload file' i]"
  ];

  for (const selector of directCandidates) {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  }

  const toolsButton = findGeminiToolsButton();
  if (!toolsButton) return null;
  const toolsRect = toolsButton.getBoundingClientRect();
  const buttonCandidates = Array.from(document.querySelectorAll("button,[role='button']")).filter((candidate) =>
    isElementVisible(candidate)
  );

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of buttonCandidates) {
    if (candidate === toolsButton || candidate.contains(toolsButton) || toolsButton.contains(candidate)) {
      continue;
    }

    const rect = candidate.getBoundingClientRect();
    const isLeftOfTools = rect.right <= toolsRect.left + 10;
    const alignedRow = Math.abs(rect.top - toolsRect.top) <= 28 || Math.abs(rect.bottom - toolsRect.bottom) <= 28;

    if (!isLeftOfTools || !alignedRow) {
      continue;
    }

    const text = `${candidate.getAttribute("aria-label") || ""} ${candidate.textContent || ""}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const iconLike = text.length <= 2 || text === "+";
    if (!iconLike) {
      continue;
    }

    const score = elementCenterDistance(rect, toolsRect);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

function findGeminiAddFileMenuItem() {
  const candidates = ["Upload files", "Add from Drive", "Photos", "NotebookLM"];
  const addFileButton = findGeminiAddFileButton();
  return findPopupMatchByTextCandidates(candidates, addFileButton);
}

// ── ChatGPT-specific helpers ────────────────────────────────

function findChatGPTPromptInput() {
  const el = document.querySelector("#prompt-textarea");
  if (el && isElementVisible(el)) return el;
  const fallback = document.querySelector("div[id='prompt-textarea']");
  if (fallback && isElementVisible(fallback)) return fallback;
  return null;
}

function findChatGPTSendButton() {
  const selectors = [
    "button[data-testid='send-button']",
    "button[aria-label='Send prompt']",
    "button.composer-submit-button-color"
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && isElementVisible(el)) return el;
  }
  return null;
}

function findChatGPTAttachButton() {
  const selectors = [
    "#composer-plus-btn",
    "button[aria-label='Add files and more']",
    "button[aria-label*='Attach']"
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && isElementVisible(el)) return el;
  }
  return null;
}

function findChatGPTModelSelector() {
  const el = document.querySelector("button[aria-label^='Model selector']");
  if (el && isElementVisible(el)) return el;
  const alt = document.querySelector("button[aria-label*='model']");
  if (alt && isElementVisible(alt)) return alt;
  return null;
}

function findChatGPTPlusMenuItem(name) {
  const attachBtn = findChatGPTAttachButton();
  return findPopupMatchByTextCandidates([name], attachBtn);
}

function findChatGPTPlusMenu() {
  const candidates = ["Add photos", "Create image", "Thinking", "Deep research"];
  const attachBtn = findChatGPTAttachButton();
  return findPopupMatchByTextCandidates(candidates, attachBtn);
}

function findChatGPTResponse() {
  const selectors = [
    "[data-message-author-role='assistant']",
    "div.agent-turn",
    "div[data-testid*='conversation-turn']"
  ];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      const last = els[els.length - 1];
      if (isElementVisible(last)) return last;
    }
  }
  return null;
}

function findChatGPTResponseButton(ariaLabel) {
  const buttons = document.querySelectorAll(`button[aria-label='${ariaLabel}']`);
  for (const btn of buttons) {
    if (isElementVisible(btn)) return btn;
  }
  return null;
}

function shouldInferClickFromVisibleState(step) {
  if (!step || step.completionRule !== "clicked_target") return false;
  // Require explicit user clicks for clicked_target steps to prevent false fast-forward.
  return false;
}

function inferClickIfNeeded(step, selector) {
  if (!step) return;
  if (!shouldInferClickFromVisibleState(step)) return;
  sendStepEvent("CLICK", step.id, selector || "inferred=menu-visible");
}

function resolveSelector(selector) {
  if (!selector || typeof selector !== "string") return null;

  try {
    if (selector === "special=gemini-add-file-button") {
      return findGeminiAddFileButton();
    }
    if (selector === "special=gemini-add-file-menu") {
      return findGeminiAddFileMenuItem();
    }
    if (selector === "special=gemini-tools-button") {
      return findGeminiToolsButton();
    }
    if (selector === "special=gemini-tools-menu") {
      return findGeminiToolsMenuItem();
    }
    if (selector === "special=gemini-model-selector") {
      const modelDirect = [
        "button[aria-label*='model' i]",
        "[role='button'][aria-label*='model' i]",
        "button[aria-label*='mode picker' i]",
        "[role='button'][aria-label*='mode picker' i]",
        "button[aria-label*='Pro' i]"
      ];
      for (const candidate of modelDirect) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }

      const toolsButton = findGeminiToolsButton();
      if (!toolsButton) return findElementByText("Pro");

      const toolsRect = toolsButton.getBoundingClientRect();
      const buttons = Array.from(document.querySelectorAll("button,[role='button']")).filter((candidate) => {
        if (!isElementVisible(candidate)) return false;
        const text = elementText(candidate);
        return text.includes("pro") || text.includes("gemini");
      });

      let best = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const candidate of buttons) {
        const rect = candidate.getBoundingClientRect();
        if (rect.left <= toolsRect.right) continue;
        const score = elementCenterDistance(rect, toolsRect);
        if (score < bestScore) {
          bestScore = score;
          best = candidate;
        }
      }

      return best || findElementByText("Pro") || findElementByText("Gemini 3");
    }
    if (selector === "special=gemini-model-menu") {
      return findGeminiModelMenuItem();
    }
    if (selector === "special=gemini-create-image") {
      return findGeminiToolsMenuItemByName("Create image");
    }
    if (selector === "special=gemini-create-video") {
      return findGeminiToolsMenuItemByName("Create video");
    }
    if (selector === "special=gemini-canvas") {
      return findGeminiToolsMenuItemByName("Canvas");
    }
    if (selector === "special=gemini-deep-research") {
      return findGeminiToolsMenuItemByName("Deep research");
    }
    if (selector === "special=gemini-microphone") {
      const micSelectors = [
        "button[aria-label*='microphone' i]",
        "button[aria-label*='voice' i]",
        "[role='button'][aria-label*='microphone' i]"
      ];
      for (const candidate of micSelectors) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }
      return null;
    }
    if (selector === "special=gemini-quick-chip-write") {
      return findElementByText("Write");
    }
    if (selector === "special=gemini-quick-chip-plan") {
      return findElementByText("Plan");
    }
    if (selector === "special=gemini-quick-chip-research") {
      return findElementByText("Research");
    }
    if (selector === "special=gemini-quick-chip-learn") {
      return findElementByText("Learn");
    }
    if (selector === "special=gemini-modify-response") {
      const modifySelectors = [
        "button[aria-label*='Modify' i]",
        "button[aria-label*='modify response' i]",
        "[role='button'][aria-label*='Modify' i]"
      ];
      for (const candidate of modifySelectors) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }
      return findElementByText("Modify response");
    }
    if (selector === "special=gemini-copy-response") {
      const copySelectors = [
        "button[aria-label*='Copy' i]",
        "[role='button'][aria-label*='Copy' i]"
      ];
      for (const candidate of copySelectors) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }
      return null;
    }
    if (selector === "special=gemini-share-export") {
      const shareSelectors = [
        "button[aria-label*='Share' i]",
        "button[aria-label*='export' i]",
        "[role='button'][aria-label*='Share' i]"
      ];
      for (const candidate of shareSelectors) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }
      return findElementByText("Share");
    }
    if (selector === "special=gemini-double-check") {
      const checkSelectors = [
        "button[aria-label*='Double-check' i]",
        "button[aria-label*='double check' i]",
        "button[aria-label*='check response' i]",
        "[role='button'][aria-label*='Double-check' i]"
      ];
      for (const candidate of checkSelectors) {
        const element = document.querySelector(candidate);
        if (element && isElementVisible(element)) return element;
      }
      return null;
    }

    // ── ChatGPT special selectors ──
    if (selector === "special=chatgpt-prompt-input") {
      return findChatGPTPromptInput();
    }
    if (selector === "special=chatgpt-send-button") {
      return findChatGPTSendButton();
    }
    if (selector === "special=chatgpt-attach-button") {
      return findChatGPTAttachButton();
    }
    if (selector === "special=chatgpt-model-selector") {
      return findChatGPTModelSelector();
    }
    if (selector === "special=chatgpt-plus-menu") {
      return findChatGPTPlusMenu();
    }
    if (selector === "special=chatgpt-create-image") {
      return findChatGPTPlusMenuItem("Create image");
    }
    if (selector === "special=chatgpt-thinking") {
      return findChatGPTPlusMenuItem("Thinking");
    }
    if (selector === "special=chatgpt-deep-research") {
      return findChatGPTPlusMenuItem("Deep research");
    }
    if (selector === "special=chatgpt-add-photos-files") {
      return findChatGPTPlusMenuItem("Add photos");
    }
    if (selector === "special=chatgpt-response") {
      return findChatGPTResponse();
    }
    if (selector === "special=chatgpt-copy-response") {
      return findChatGPTResponseButton("Copy");
    }
    if (selector === "special=chatgpt-read-aloud") {
      return findChatGPTResponseButton("Read aloud");
    }
    if (selector === "special=chatgpt-good-response") {
      return findChatGPTResponseButton("Good response");
    }
    if (selector === "special=chatgpt-bad-response") {
      return findChatGPTResponseButton("Bad response");
    }
    if (selector === "special=chatgpt-regenerate") {
      return findChatGPTResponseButton("Regenerate");
    }
    if (selector === "special=chatgpt-new-chat") {
      return findElementByText("New chat");
    }
    if (selector === "special=chatgpt-search-chats") {
      return findElementByText("Search chats");
    }
    if (selector === "special=chatgpt-images-link") {
      const link = document.querySelector("a[href='/images']");
      if (link && isElementVisible(link)) return link;
      return findElementByText("Images");
    }
    if (selector === "special=chatgpt-explore-gpts") {
      const link = document.querySelector("a[href='/gpts']");
      if (link && isElementVisible(link)) return link;
      return findElementByText("Explore GPTs");
    }
    
    // ── NotebookLM special selectors ──
    if (selector === "special=notebooklm-new-notebook") {
      const candidates = [
        "button[aria-label*='New notebook' i]",
        "[role='button'][aria-label*='New notebook' i]",
        "button[aria-label*='Create' i]",
        "[role='button'][aria-label*='Create' i]",
        "div[class*='new-notebook']"
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && isElementVisible(el)) return el;
      }
      return findElementByText("New notebook") || findElementByText("Create new") || findElementByText("New");
    }
    if (selector === "special=notebooklm-chat-input") {
      const candidates = [
        "input[placeholder*='typing' i]",
        "textarea",
        "[role='textbox']"
      ];
      for (const sel of candidates) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (isElementVisible(el)) return el;
        }
      }
      return findElementByText("Start typing");
    }
    if (selector === "special=notebooklm-add-source") {
      const candidates = [
        "button[aria-label*='Add source' i]",
        "[role='button'][aria-label*='Add source' i]"
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && isElementVisible(el)) return el;
      }
      return findElementByText("Add sources") || findElementByText("Add source");
    }
    if (selector === "special=notebooklm-save-note") {
      const candidates = [
        "button[aria-label*='Save to note' i]",
        "[role='button'][aria-label*='Save to note' i]"
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && isElementVisible(el)) return el;
      }
      return findElementByText("Save to note");
    }

    if (selector.startsWith("text=")) {
      return findElementByText(selector.slice(5));
    }

    if (selector.startsWith("css=")) {
      return document.querySelector(selector.slice(4));
    }

    return document.querySelector(selector);
  } catch {
    return null;
  }
}

function positionCallout(targetElement) {
  if (!calloutBox || !calloutArrow || !connectorLine || !targetElement) return;

  const rect = targetElement.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const panelWidth = Math.min(340, Math.max(260, Math.floor(viewportW * 0.28)));
  const gap = 18;

  calloutBox.style.width = `${panelWidth}px`;
  calloutBox.style.left = "-9999px";
  calloutBox.style.top = "0";

  const panelHeight = calloutBox.offsetHeight || 120;
  const preferredRightLeft = rect.right + gap;
  const canPlaceRight = preferredRightLeft + panelWidth + 12 <= viewportW;
  const left = canPlaceRight
    ? preferredRightLeft
    : clamp(rect.left - panelWidth - gap, 12, viewportW - panelWidth - 12);
  const top = clamp(rect.top + rect.height / 2 - panelHeight / 2, 12, viewportH - panelHeight - 12);

  calloutBox.style.left = `${left}px`;
  calloutBox.style.top = `${top}px`;

  const anchorY = clamp(rect.top + rect.height / 2, top + 16, top + panelHeight - 16);
  const arrowTop = anchorY - top - 8;

  if (canPlaceRight) {
    calloutArrow.style.left = "-8px";
    calloutArrow.style.right = "auto";
    calloutArrow.style.top = `${arrowTop}px`;
    calloutArrow.style.borderTop = "8px solid transparent";
    calloutArrow.style.borderBottom = "8px solid transparent";
    calloutArrow.style.borderRight = "8px solid rgba(15, 23, 42, 0.95)";
    calloutArrow.style.borderLeft = "0";
  } else {
    calloutArrow.style.right = "-8px";
    calloutArrow.style.left = "auto";
    calloutArrow.style.top = `${arrowTop}px`;
    calloutArrow.style.borderTop = "8px solid transparent";
    calloutArrow.style.borderBottom = "8px solid transparent";
    calloutArrow.style.borderLeft = "8px solid rgba(15, 23, 42, 0.95)";
    calloutArrow.style.borderRight = "0";
  }

  const startX = canPlaceRight ? rect.right : rect.left;
  const endX = canPlaceRight ? left : left + panelWidth;
  const startY = rect.top + rect.height / 2;
  const endY = anchorY;
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 2) {
    connectorLine.style.display = "none";
    return;
  }

  connectorLine.style.display = "block";
  connectorLine.style.left = `${startX}px`;
  connectorLine.style.top = `${startY}px`;
  connectorLine.style.width = `${distance}px`;
  connectorLine.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
}

function getActionHint(step) {
  const action = (step.actionType || "").toLowerCase();
  const rule = (step.completionRule || "").toLowerCase();
  if (action === "click" || rule === "clicked_target") return "👆 Click the highlighted area";
  if (action === "input" || rule === "input_detected") return "⌨️ Type in the highlighted area";
  if (action === "wait_for_response" || rule === "response_detected") return "⏳ Waiting for AI response...";
  if (action === "navigate" || rule === "element_visible") return "👀 Checking the page is ready";
  return "📍 Follow the highlight";
}

function showCallout(step, selector, targetElement) {
  ensureCalloutElements();
  if (!calloutTitle || !calloutBody || !calloutMeta) return;

  calloutTitle.textContent = `Step ${step.order}: ${step.instruction}`;
  calloutBody.textContent = describeStep(step, selector);
  calloutMeta.textContent = getActionHint(step);
  lastCalloutSelector = selector;
  positionCallout(targetElement);
}

function scheduleCalloutLayout() {
  if (layoutRaf !== null) return;

  layoutRaf = window.requestAnimationFrame(() => {
    layoutRaf = null;

    if (!activeRunState || !activeRunState.currentStep || !highlightedElement) {
      return;
    }

    positionCallout(highlightedElement);
  });
}

function findTarget(selectors) {
  for (const selector of selectors || []) {
    const element = resolveSelector(selector);
    if (element) {
      return { selector, element };
    }
  }
  return null;
}

function inputBucket(length) {
  if (length <= 0) return "0";
  if (length <= 20) return "1-20";
  if (length <= 100) return "21-100";
  return "100+";
}

function sendStepEvent(eventType, stepId, selectorId, inputLengthBucketValue) {
  const key = `${stepId}:${eventType}:${selectorId || "none"}:${inputLengthBucketValue || "none"}`;
  if (key === lastSignalKey) {
    return;
  }
  lastSignalKey = key;

  chrome.runtime.sendMessage({
    type: "STEP_EVENT",
    stepId,
    eventType,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    meta: {
      selectorId,
      inputLengthBucket: inputLengthBucketValue
    }
  });
}

function applyRunState(state) {
  activeRunState = state;
  clearHighlight();
  clearCallout();

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (!state || !state.currentStep || state.status === "COMPLETED") {
    return;
  }

  const step = state.currentStep;
  const match = findTarget(step.targetSelectors);

  if (match) {
    highlightedElement = match.element;
    highlightedElement.style.outline = "2px solid #8b5cf6";
    highlightedElement.style.outlineOffset = "4px";
    highlightedElement.style.borderRadius = window.getComputedStyle(highlightedElement).borderRadius || "4px";
    highlightedElement.style.animation = "pulseBorder 2s infinite";
    showCallout(step, match.selector, match.element);
    inferClickIfNeeded(step, match.selector);

    if (step.completionRule === "element_visible") {
      sendStepEvent("ELEMENT_FOUND", step.id, match.selector);
    }
  } else {
    inferClickIfNeeded(step, "inferred=no-target-menu-visible");
  }

  observer = new MutationObserver(() => {
    if (!activeRunState || !activeRunState.currentStep) return;
    const current = activeRunState.currentStep;
    const currentMatch = findTarget(current.targetSelectors);

    if (!currentMatch) {
      inferClickIfNeeded(current, "inferred=no-target-menu-visible");
      clearHighlight();
      clearCallout();
      return;
    }

    if (highlightedElement !== currentMatch.element) {
      clearHighlight();
      highlightedElement = currentMatch.element;
      highlightedElement.style.outline = "2px solid #8b5cf6";
      highlightedElement.style.outlineOffset = "4px";
      highlightedElement.style.borderRadius = window.getComputedStyle(highlightedElement).borderRadius || "4px";
      highlightedElement.style.animation = "pulseBorder 2s infinite";
    }

    if (lastCalloutSelector !== currentMatch.selector) {
      showCallout(current, currentMatch.selector, currentMatch.element);
    } else {
      scheduleCalloutLayout();
    }

    inferClickIfNeeded(current, currentMatch.selector);

    if (current.completionRule === "response_detected" && currentMatch) {
      sendStepEvent("RESPONSE_VISIBLE", current.id, currentMatch.selector);
    }

    if (current.completionRule === "element_visible" && currentMatch) {
      sendStepEvent("ELEMENT_FOUND", current.id, currentMatch.selector);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener(
  "scroll",
  () => {
    scheduleCalloutLayout();
  },
  true
);

window.addEventListener("resize", () => {
  scheduleCalloutLayout();
});

document.addEventListener(
  "click",
  (event) => {
    if (!event.isTrusted) return;
    if (!activeRunState || !activeRunState.currentStep) return;
    const step = activeRunState.currentStep;
    if (step.completionRule !== "clicked_target") return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    for (const selector of step.targetSelectors) {
      const selected = resolveSelector(selector);
      if (selected && (target === selected || selected.contains(target))) {
        sendStepEvent("CLICK", step.id, selector);
        break;
      }
    }
  },
  true
);

document.addEventListener(
  "input",
  (event) => {
    if (!activeRunState || !activeRunState.currentStep) return;
    const step = activeRunState.currentStep;
    if (step.completionRule !== "input_detected") return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    for (const selector of step.targetSelectors) {
      const selected = resolveSelector(selector);
      if (!selected) continue;
      if (target !== selected && !selected.contains(target)) continue;

      let text = "";
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        text = target.value;
      } else {
        text = target.textContent || "";
      }

      sendStepEvent("INPUT_ACTIVITY", step.id, selector, inputBucket(text.trim().length));
      break;
    }
  },
  true
);

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "RUN_STATE") return;
  lastSignalKey = null;
  applyRunState(message.state);
});

chrome.runtime.sendMessage({ type: "CONTENT_READY" });
