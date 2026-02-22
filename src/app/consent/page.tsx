"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export default function ConsentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function acceptConsent() {
    setLoading(true);
    setError(null);

    const response = await apiFetch("/api/consent/accept", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Failed to save consent");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="main-wrap">
      <h1>Monitoring Consent</h1>
      <div className="panel" style={{ maxWidth: 700, display: "grid", gap: "0.7rem" }}>
        <p>
          This training system verifies step completion while you are on Gemini pages. We store only action events,
          selector identifiers, and URL hash. We do not store your prompt text or Gemini responses.
        </p>
        <p className="muted">You must accept this policy to start lessons.</p>
        {error ? <p className="status-warn">{error}</p> : null}
        <button className="primary" onClick={acceptConsent} disabled={loading}>
          {loading ? "Saving..." : "I Accept and Continue"}
        </button>
      </div>
    </main>
  );
}
