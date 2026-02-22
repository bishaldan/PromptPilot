"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminStats = {
  totalUsers: number;
  totalLessons: number;
  totalCompletions: number;
  totalBadges: number;
  tools: { id: string; name: string; icon: string; color: string; lessonCount: number }[];
};

type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  completedLessons: number;
  badges: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "users">("overview");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403 || r.status === 401) {
          router.push("/dashboard");
          return null;
        }
        return r.json();
      })
      .then((data) => { if (data) setStats(data); })
      .catch(() => setError("Failed to load admin data"));

    loadUsers();
  }, []);

  function loadUsers(q = "") {
    fetch(`/api/admin/users?search=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {});
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadUsers(search);
  }

  if (error) return <div className="main-wrap"><p className="status-warn">{error}</p></div>;
  if (!stats) return <div className="main-wrap"><p className="muted">Loading admin panel…</p></div>;

  return (
    <div className="main-wrap">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button className={`admin-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
          Users
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="stats-grid">
            <div className="stat-card panel">
              <span className="stat-number">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card panel">
              <span className="stat-number">{stats.totalLessons}</span>
              <span className="stat-label">Active Lessons</span>
            </div>
            <div className="stat-card panel">
              <span className="stat-number">{stats.totalCompletions}</span>
              <span className="stat-label">Completions</span>
            </div>
            <div className="stat-card panel">
              <span className="stat-number">{stats.totalBadges}</span>
              <span className="stat-label">Badges Awarded</span>
            </div>
          </div>

          <h2 style={{ marginTop: "2rem" }}>Tools</h2>
          <div className="stats-grid">
            {stats.tools.map((tool) => (
              <div className="stat-card panel" key={tool.id}>
                <span className="stat-number">{tool.icon} {tool.name}</span>
                <span className="stat-label">{tool.lessonCount} lessons</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "users" && (
        <>
          <form className="admin-search" onSubmit={handleSearch}>
            <input
              placeholder="Search by email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="primary small">Search</button>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Completed</th>
                  <th>Badges</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName || "—"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.completedLessons}</td>
                    <td>{u.badges}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
