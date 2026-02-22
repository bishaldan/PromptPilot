const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

function resolveApiBaseUrl(): string {
  if (!configuredApiBaseUrl) {
    return "";
  }

  try {
    return new URL(configuredApiBaseUrl).origin;
  } catch {
    return configuredApiBaseUrl;
  }
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const resolved = resolveApiBaseUrl();
  if (!resolved) {
    return normalizedPath;
  }
  return `${resolved}${normalizedPath}`;
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = buildApiUrl(path);
  const resolvedBase = resolveApiBaseUrl();
  const isCrossOrigin =
    Boolean(resolvedBase) &&
    typeof window !== "undefined" &&
    resolvedBase !== window.location.origin;

  return fetch(url, {
    ...init,
    credentials: isCrossOrigin ? "include" : (init.credentials ?? "same-origin")
  });
}
