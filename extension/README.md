# PromptPilot Coach Extension

Manifest V3 Chrome extension used by PromptPilot to bridge lesson runs from the local web app into supported AI tool tabs and report privacy-safe verification events back to the app.

## Responsibilities

- Receives `CONNECT_LESSON_FROM_WEB` from the PromptPilot web app through `bridge.js`
- Validates lesson-run tokens with `/api/extension/connect`
- Pushes current run state into supported tool tabs
- Highlights the active target and renders coaching callouts
- Reports step events back to `/api/lesson-runs/:runId/events`

## Supported selector strategies

- Plain CSS selectors
- `css=...` explicit CSS selectors
- `text=...` visible-text matchers
- `special=gemini-add-file-button`
- `special=gemini-add-file-menu`
- `special=gemini-tools-button`
- `special=gemini-tools-menu`
- `special=gemini-model-selector`
- `special=gemini-model-menu`

## Supported hosts

- `https://gemini.google.com/*`
- `https://chatgpt.com/*`
- `https://notebooklm.google.com/*`
- `http://localhost:3000/*`
- `http://127.0.0.1:3000/*`

## Local development

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select the `extension/` directory
5. Reload the extension after any source change

The extension is intentionally scoped to local PromptPilot development hosts and the supported AI tools above. Do not add personal network hostnames to the manifest before committing.
