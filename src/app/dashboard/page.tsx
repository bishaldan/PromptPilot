"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type ToolInfo = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  lessonCount: number;
};

type LessonSummary = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string | null;
  estimatedMinutes: number | null;
  toolId: string;
  steps: Array<{ id: string }>;
};

type ProgressPayload = {
  user?: { id: string; email: string; displayName?: string; role?: string };
  runs?: Array<{
    runId: string;
    lessonId: string;
    lessonTitle: string;
    status: string;
    progressPercent: number;
  }>;
  badges?: Array<{
    lessonId: string;
    lessonTitle: string;
    awardedAt: string;
  }>;
  error?: string;
};

export default function DashboardPage() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTool, setSelectedTool] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const [toolsRes, progressRes] = await Promise.all([
        apiFetch("/api/tools"),
        apiFetch("/api/me/progress"),
      ]);

      const toolsData = await toolsRes.json().catch(() => []);
      const progressPayload = (await progressRes.json().catch(() => ({}))) as ProgressPayload;

      setTools(Array.isArray(toolsData) ? toolsData : []);
      setProgress(progressPayload);

      // Load lessons for all tools
      const allLessons: LessonSummary[] = [];
      for (const tool of (Array.isArray(toolsData) ? toolsData : []) as ToolInfo[]) {
        const lessonRes = await apiFetch(`/api/tools/${tool.id}/lessons`);
        const lessonData = await lessonRes.json().catch(() => ({ lessons: [] }));
        const toolLessons = (lessonData.lessons || []).map((l: LessonSummary) => ({
          ...l,
          toolId: tool.id,
        }));
        allLessons.push(...toolLessons);
      }
      setLessons(allLessons);
    }

    void load();
  }, []);

  const badgeLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const badge of progress?.badges ?? []) {
      map.set(badge.lessonId, badge.awardedAt);
    }
    return map;
  }, [progress]);

  const runLookup = useMemo(() => {
    const map = new Map<string, { status: string; progressPercent: number }>();
    for (const run of progress?.runs ?? []) {
      map.set(run.lessonId, { status: run.status, progressPercent: run.progressPercent });
    }
    return map;
  }, [progress]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      if (selectedTool !== "all" && lesson.toolId !== selectedTool) return false;
      if (difficultyFilter !== "all" && lesson.difficulty !== difficultyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!lesson.title.toLowerCase().includes(q) && !lesson.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [lessons, selectedTool, difficultyFilter, searchQuery]);

  const completedCount = progress?.badges?.length ?? 0;
  const inProgressCount = (progress?.runs ?? []).filter((r) => r.status === "IN_PROGRESS").length;

  const difficultyColor: Record<string, string> = {
    BEGINNER: "#22c55e",
    INTERMEDIATE: "#f59e0b",
    ADVANCED: "#ef4444",
  };

  return (
    <main className="main-wrap">
      <div className="dashboard-header">
        <div>
          <h1>Learning Dashboard</h1>
          <p className="muted">Pick a lesson and practice with guided verification in real time.</p>
        </div>
      </div>

      {progress?.error ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <p className="status-warn">{progress.error}</p>
          <Link href="/login">Log in</Link>
        </div>
      ) : null}

      {/* Stats Bar */}
      <div className="stats-grid stats-compact">
        <div className="stat-card panel">
          <span className="stat-number">{lessons.length}</span>
          <span className="stat-label">Total Lessons</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{inProgressCount}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card panel">
          <span className="stat-number">{tools.length}</span>
          <span className="stat-label">Tools</span>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <input
          className="search-input"
          type="text"
          placeholder="Search lessons…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-group">
          <button
            className={`filter-chip ${selectedTool === "all" ? "active" : ""}`}
            onClick={() => setSelectedTool("all")}
          >
            All Tools
          </button>
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`filter-chip ${selectedTool === tool.id ? "active" : ""}`}
              onClick={() => setSelectedTool(tool.id)}
              style={selectedTool === tool.id ? { borderColor: tool.color } : {}}
            >
              {tool.icon} {tool.name}
            </button>
          ))}
        </div>

        <div className="filter-group">
          {["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((d) => (
            <button
              key={d}
              className={`filter-chip ${difficultyFilter === d ? "active" : ""}`}
              onClick={() => setDifficultyFilter(d)}
            >
              {d === "all" ? "All Levels" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="status-warn">{error}</p> : null}

      {/* Lesson Cards */}
      <section className="card-list">
        {filteredLessons.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>
            No lessons found matching your filters.
          </p>
        )}
        {filteredLessons.map((lesson) => {
          const awardedAt = badgeLookup.get(lesson.id);
          const run = runLookup.get(lesson.id);
          const toolInfo = tools.find((t) => t.id === lesson.toolId);

          return (
            <article className="panel lesson-card" key={lesson.id}>
              <div className="lesson-card-header">
                <div className="lesson-card-meta">
                  {toolInfo && (
                    <span className="tool-badge" style={{ color: toolInfo.color }}>
                      {toolInfo.icon} {toolInfo.name}
                    </span>
                  )}
                  <span
                    className="difficulty-badge"
                    style={{ color: difficultyColor[lesson.difficulty] || "#888" }}
                  >
                    {lesson.difficulty?.charAt(0) + lesson.difficulty?.slice(1).toLowerCase()}
                  </span>
                </div>
                {awardedAt && <span className="badge-earned">🏅</span>}
              </div>

              <h3 style={{ marginTop: 0 }}>{lesson.title}</h3>
              <p className="muted">{lesson.description}</p>

              <div className="lesson-card-footer">
                <span className="step-count">{lesson.steps.length} steps</span>
                {lesson.estimatedMinutes && (
                  <span className="time-estimate">~{lesson.estimatedMinutes} min</span>
                )}
              </div>

              {/* Progress Bar */}
              {run && run.status === "IN_PROGRESS" && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${run.progressPercent}%` }} />
                  <span className="progress-label">{run.progressPercent}%</span>
                </div>
              )}

              {awardedAt ? (
                <p className="status-ok">✓ Badge earned</p>
              ) : run?.status === "IN_PROGRESS" ? (
                <p className="status-progress">In progress</p>
              ) : null}

              <Link href={`/lessons/${lesson.id}`}>
                <button className="primary">
                  {run?.status === "IN_PROGRESS" ? "Continue" : awardedAt ? "Review" : "Start lesson"}
                </button>
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
