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
      <h1>Your Profile</h1>

      <div className="profile-card panel">
        <div className="profile-avatar">
          {(stats.displayName || stats.email || "U")
            .split(" ")
            .map((w: string) => w[0] || "")
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U"}
        </div>
        <div className="profile-info">
          {editing ? (
            <div className="profile-edit-row">
              <input
                className="profile-name-input"
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
            <div className="profile-name-row">
              <h2>{stats.displayName || "No name set"}</h2>
              <button className="secondary small" onClick={() => setEditing(true)}>
                Edit
              </button>
            </div>
          )}
          <p className="muted">{stats.email}</p>
          <p className="muted">Member since {new Date(stats.createdAt).toLocaleDateString()}</p>
          {stats.role === "admin" && <span className="badge badge-admin">Admin</span>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card panel">
          <span className="stat-number">{stats.completedLessons}</span>
          <span className="stat-label">Lessons Completed</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{stats.badgesEarned}</span>
          <span className="stat-label">Badges Earned</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{completionRate}%</span>
          <span className="stat-label">Completion Rate</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{stats.totalStepsCompleted}</span>
          <span className="stat-label">Steps Completed</span>
        </div>
      </div>
    </div>
  );
}
