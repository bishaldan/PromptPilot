# Extension

Manifest V3 extension for Gemini page guidance.

## Behavior
- Receives `CONNECT_LESSON_FROM_WEB` via `bridge.js` on `localhost:3000` pages
- Validates run token with backend (`/api/extension/connect`)
- Sends run state to Gemini content script
- Content script highlights current step target
- Content script shows a right-side explanation callout connected by an arrow/line to the highlighted target
- Content script reports detected step events to backend

Selector matching supported in lesson `targetSelectors`:
- Plain CSS selector (default)
- `css=...` explicit CSS selector
- `text=...` find first visible element whose label/text contains that text
- `special=gemini-add-file-button` robust matcher for Gemini `+` Add file button
- `special=gemini-add-file-menu` menu item matcher for `+` attachment menu
- `special=gemini-tools-button` robust matcher for Gemini Tools button
- `special=gemini-tools-menu` menu item matcher for Tools popup
- `special=gemini-model-selector` robust matcher for Gemini model selector (Pro/Gemini 3)
- `special=gemini-model-menu` menu item matcher for model options popup

## Supported Host
- `https://gemini.google.com/*`
- `http://localhost:3000/*` (bridge script + Next.js API calls)
- `http://127.0.0.1:3000/*` (bridge script + Next.js API calls)
