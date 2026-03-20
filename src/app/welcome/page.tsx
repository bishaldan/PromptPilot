"use client";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="main-wrap">
      <div className="welcome-container">
        <div className="welcome-icon">✦</div>
        <h1>Welcome to PromptPilot!</h1>
        <p className="welcome-subtitle">
          Your personal AI skills training platform. We'll guide you step-by-step through real AI tools
          with interactive, hands-on lessons.
        </p>

        <div className="welcome-features">
          <div className="welcome-feature panel">
            <span className="welcome-feature-icon">🎯</span>
            <h3>Interactive Lessons</h3>
            <p className="muted">Step-by-step guidance with real-time element highlighting</p>
          </div>
          <div className="welcome-feature panel">
            <span className="welcome-feature-icon">🏅</span>
            <h3>Earn Badges</h3>
            <p className="muted">Complete lessons to earn badges and track your progress</p>
          </div>
          <div className="welcome-feature panel">
            <span className="welcome-feature-icon">🔧</span>
            <h3>Multiple AI Tools</h3>
            <p className="muted">Learn Gemini, ChatGPT, and more — all in one place</p>
          </div>
        </div>

        <button className="primary welcome-cta" onClick={() => router.push("/consent")}>
          Get Started →
        </button>
      </div>
    </main>
  );
}
