"use client";
import { useEffect, useState } from "react";

type UserStats = {
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  totalLessons: number;
  completedLessons: number;
  badgesEarned: number;
  totalStepsCompleted: number;
};

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setEditName(data.displayName || "");
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: editName }),
    });
    if (res.ok) {
      const updated = await res.json();
      setStats((prev) => (prev ? { ...prev, displayName: updated.displayName } : prev));
      setEditing(false);
    }
    setSaving(false);
  }

  if (!stats)
    return (
      <div className="main-wrap">
        <p className="muted">Loading profile…</p>
      </div>
    );

  const completionRate = stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0;

  return (
    <div className="main-wrap">
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Your Profile</h1>
          <p className="hero-subtitle" style={{ margin: 0, fontSize: "1rem" }}>
            Member since {new Date(stats.createdAt).toLocaleDateString()}
          </p>
        </div>
        {stats.role === "admin" && (
           <div style={{ background: "var(--bg-soft)", padding: "0.5rem 1rem", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
             ADMIN
           </div>
        )}
      </header>

      <div className="profile-card panel" style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
        <div className="profile-avatar" style={{ 
          width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent-gradient)", color: "white", 
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold" 
        }}>
          {(stats.displayName || stats.email || "U")
            .split(" ")
            .map((w: string) => w[0] || "")
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U"}
        </div>
        
        <div className="profile-info" style={{ flex: 1 }}>
          {editing ? (
            <div className="profile-edit-row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input
                className="profile-name-input"
                style={{ flex: "1", minWidth: "200px" }}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your display name"
              />
              <button className="primary small" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="secondary small" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="profile-name-row" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <h2 style={{ margin: 0 }}>{stats.displayName || "No name set"}</h2>
              <button className="secondary small" onClick={() => setEditing(true)}>
                Edit Name
              </button>
            </div>
          )}
          <p className="muted" style={{ margin: "0.5rem 0 0 0" }}>{stats.email}</p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Your Learning Stats</h2>
      <div className="stats-grid card-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <article className="stat-card panel" style={{ padding: "2rem", textAlign: "center" }}>
          <strong style={{ fontSize: "2.5rem", display: "block", color: "var(--accent)", marginBottom: "0.5rem", fontWeight: 800 }}>{stats.completedLessons}</strong>
          <span className="muted" style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lessons Completed</span>
        </article>

        <article className="stat-card panel" style={{ padding: "2rem", textAlign: "center" }}>
          <strong style={{ fontSize: "2.5rem", display: "block", color: "var(--accent)", marginBottom: "0.5rem", fontWeight: 800 }}>{stats.badgesEarned}</strong>
          <span className="muted" style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Badges Earned</span>
        </article>
        
        <article className="stat-card panel" style={{ padding: "2rem", textAlign: "center" }}>
          <strong style={{ fontSize: "2.5rem", display: "block", color: "var(--accent)", marginBottom: "0.5rem", fontWeight: 800 }}>{completionRate}%</strong>
          <span className="muted" style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Completion Rate</span>
        </article>

        <article className="stat-card panel" style={{ padding: "2rem", textAlign: "center" }}>
          <strong style={{ fontSize: "2.5rem", display: "block", color: "var(--accent)", marginBottom: "0.5rem", fontWeight: 800 }}>{stats.totalStepsCompleted}</strong>
          <span className="muted" style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Steps Completed</span>
        </article>
      </div>
    </div>
  );
}
