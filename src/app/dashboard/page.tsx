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
  description?: string;
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

/* ── Category ordering & icons ────────────────── */
const CATEGORY_ORDER = [
  "Getting Started",
  "Creative Tools",
  "Research",
  "Productivity",
  "Personalization",
  "Collaboration",
  "Reasoning",
  "Advanced Features",
];

const CATEGORY_ICONS: Record<string, string> = {
  "Getting Started": "🚀",
  "Creative Tools": "🎨",
  Research: "🔍",
  Productivity: "📁",
  Personalization: "🧠",
  Collaboration: "👥",
  Reasoning: "💡",
  "Advanced Features": "⚡",
};

/* ── Course display names ────────────────────── */
const COURSE_NAMES: Record<string, string> = {
  chatgpt: "Master ChatGPT",
  gemini: "Master Google Gemini",
};

const COURSE_DESCRIPTIONS: Record<string, string> = {
  chatgpt: "From chat basics to deep research, image generation, and advanced features",
  gemini: "Learn Google's AI assistant — chat, canvas, research, and more",
};

const COURSE_GRADIENTS: Record<string, string> = {
  chatgpt: "linear-gradient(135deg, #10a37f 0%, #1a7f5a 100%)",
  gemini: "linear-gradient(135deg, #4285f4 0%, #7b68ee 100%)",
};

const difficultyColor: Record<string, string> = {
  BEGINNER: "#22c55e",
  INTERMEDIATE: "#f59e0b",
  ADVANCED: "#ef4444",
};

/* ── Progress Ring component ─────────────────── */
function ProgressRing({
  completed,
  total,
  size = 72,
  stroke = 5,
  color = "var(--accent)",
}: {
  completed: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="progress-ring-wrap">
      <svg width={size} height={size} className="progress-ring-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>
      <span className="progress-ring-label">
        {completed}/{total}
      </span>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────── */
export default function DashboardPage() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
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
    for (const badge of progress?.badges ?? []) map.set(badge.lessonId, badge.awardedAt);
    return map;
  }, [progress]);

  const runLookup = useMemo(() => {
    const map = new Map<string, { status: string; progressPercent: number }>();
    for (const run of progress?.runs ?? []) map.set(run.lessonId, { status: run.status, progressPercent: run.progressPercent });
    return map;
  }, [progress]);

  /* ── Derived data per course ──────── */
  const courseData = useMemo(() => {
    return tools.map((tool) => {
      const toolLessons = lessons.filter((l) => l.toolId === tool.id);
      const completed = toolLessons.filter((l) => badgeLookup.has(l.id)).length;
      const inProgress = toolLessons.filter((l) => {
        const run = runLookup.get(l.id);
        return run?.status === "IN_PROGRESS";
      }).length;
      const totalMinutes = toolLessons.reduce((sum, l) => sum + (l.estimatedMinutes ?? 5), 0);

      return {
        tool,
        lessons: toolLessons,
        completed,
        inProgress,
        total: toolLessons.length,
        totalMinutes,
      };
    });
  }, [tools, lessons, badgeLookup, runLookup]);

  const completedCount = progress?.badges?.length ?? 0;
  const inProgressCount = (progress?.runs ?? []).filter((r) => r.status === "IN_PROGRESS").length;

  /* ── Category-grouped lessons ─────── */
  const selectedCourseData = courseData.find((c) => c.tool.slug === selectedCourse);

  const categorizedLessons = useMemo(() => {
    if (!selectedCourseData) return [];

    let filtered = selectedCourseData.lessons;

    // Apply filters
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((l) => l.difficulty === difficultyFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }

    // Group by category
    const groups = new Map<string, LessonSummary[]>();
    for (const lesson of filtered) {
      const cat = lesson.category || "Other";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(lesson);
    }

    // Sort by CATEGORY_ORDER
    return Array.from(groups.entries()).sort(([a], [b]) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [selectedCourseData, difficultyFilter, searchQuery]);

  /* ════════════════════════════════════
     RENDER: Course Detail View
     ════════════════════════════════════ */
  if (selectedCourse && selectedCourseData) {
    const { tool, completed, total, totalMinutes } = selectedCourseData;
    const slug = tool.slug as keyof typeof COURSE_GRADIENTS;

    return (
      <main className="main-wrap">
        {/* Course Header */}
        <div
          className="course-detail-header"
          style={{ background: COURSE_GRADIENTS[slug] || "var(--accent-gradient)" }}
        >
          <button className="back-btn" onClick={() => { setSelectedCourse(null); setSearchQuery(""); setDifficultyFilter("all"); }}>
            ← Back to courses
          </button>
          <div className="course-detail-title-row">
            <div>
              <h1 className="course-detail-title">
                {['chatgpt', 'gemini'].includes(slug) ? (
                  <img src={`/images/logos/${slug}.svg`} alt={`${tool.name} logo`} width={32} height={32} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                ) : (
                  tool.icon
                )}
                {COURSE_NAMES[slug] || tool.name}
              </h1>
              <p className="course-detail-subtitle">
                {COURSE_DESCRIPTIONS[slug] || tool.description || ""}
              </p>
              <div className="course-detail-meta">
                <span>{total} lessons</span>
                <span>•</span>
                <span>~{Math.round(totalMinutes / 60 * 10) / 10} hours</span>
                <span>•</span>
                <span>{completed} completed</span>
              </div>
            </div>
            <ProgressRing completed={completed} total={total} size={80} stroke={6} color="#fff" />
          </div>

          {/* Course progress bar */}
          <div className="course-progress-bar">
            <div
              className="course-progress-fill"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-filters" style={{ marginTop: "1.5rem" }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search lessons…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

        {/* Categorized Lessons */}
        {categorizedLessons.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>
            No lessons found matching your filters.
          </p>
        )}

        {categorizedLessons.map(([category, catLessons]) => {
          const catCompleted = catLessons.filter((l) => badgeLookup.has(l.id)).length;
          return (
            <section key={category} className="category-section">
              <div className="category-header">
                <h2 className="category-title">
                  <span className="category-icon">{CATEGORY_ICONS[category] || "📚"}</span>
                  {category}
                </h2>
                <span className="category-count">
                  {catCompleted}/{catLessons.length} complete
                </span>
              </div>

              <div className="category-lessons">
                {catLessons.map((lesson) => {
                  const awardedAt = badgeLookup.get(lesson.id);
                  const run = runLookup.get(lesson.id);

                  return (
                    <Link
                      href={`/lessons/${lesson.id}`}
                      key={lesson.id}
                      className="lesson-row"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="lesson-row-status">
                        {awardedAt ? (
                          <span className="lesson-status-icon completed">✓</span>
                        ) : run?.status === "IN_PROGRESS" ? (
                          <span className="lesson-status-icon active">▶</span>
                        ) : (
                          <span className="lesson-status-icon locked">○</span>
                        )}
                      </div>
                      <div className="lesson-row-content">
                        <div className="lesson-row-title-wrap">
                          <span className="lesson-row-title">{lesson.title}</span>
                          {awardedAt && <span className="badge-earned-sm">🏅</span>}
                        </div>
                        <span className="lesson-row-desc">{lesson.description}</span>
                      </div>
                      <div className="lesson-row-meta">
                        <span
                          className="difficulty-pill"
                          style={{
                            background: `${difficultyColor[lesson.difficulty] || "#888"}20`,
                            color: difficultyColor[lesson.difficulty] || "#888",
                          }}
                        >
                          {lesson.difficulty?.charAt(0) + lesson.difficulty?.slice(1).toLowerCase()}
                        </span>
                        <span className="lesson-row-steps">
                          {lesson.steps.length} steps
                          {lesson.estimatedMinutes && ` • ~${lesson.estimatedMinutes}m`}
                        </span>
                      </div>
                      <div className="lesson-row-action">
                        <span className="lesson-row-btn">
                          {run?.status === "IN_PROGRESS"
                            ? "Continue"
                            : awardedAt
                            ? "Review"
                            : "Start"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    );
  }

  /* ════════════════════════════════════
     RENDER: Course Cards (default)
     ════════════════════════════════════ */
  return (
    <main className="main-wrap">
      <div className="dashboard-header">
        <div>
          <h1>Learning Dashboard</h1>
          <p className="muted">Choose a course to start building your AI skills.</p>
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
          <span className="stat-label">Courses</span>
        </div>
      </div>

      {/* Course Cards */}
      <div className="course-grid">
        {courseData.map(({ tool, completed, inProgress, total, totalMinutes }) => {
          const slug = tool.slug as keyof typeof COURSE_GRADIENTS;
          const hasProgress = completed > 0 || inProgress > 0;

          return (
            <article
              key={tool.id}
              className="course-card panel"
              onClick={() => setSelectedCourse(tool.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedCourse(tool.slug)}
            >
              <div
                className="course-card-accent"
                style={{ background: COURSE_GRADIENTS[slug] || "var(--accent-gradient)" }}
              />
              <div className="course-card-body">
                <div className="course-card-top">
                  <div className="course-card-icon">
                    {['chatgpt', 'gemini'].includes(slug) ? (
                      <img src={`/images/logos/${slug}.svg`} alt={`${tool.name} logo`} width={40} height={40} />
                    ) : (
                      tool.icon
                    )}
                  </div>
                  <ProgressRing
                    completed={completed}
                    total={total}
                    size={64}
                    stroke={4}
                    color={tool.color || "var(--accent)"}
                  />
                </div>
                <h2 className="course-card-title">
                  {COURSE_NAMES[slug] || tool.name}
                </h2>
                <p className="course-card-desc">
                  {COURSE_DESCRIPTIONS[slug] || tool.description || ""}
                </p>
                <div className="course-card-meta">
                  <span>{total} lessons</span>
                  <span>•</span>
                  <span>~{Math.round(totalMinutes / 60 * 10) / 10}h</span>
                </div>
                <button className="course-card-btn primary">
                  {hasProgress ? "Continue Learning →" : "Start Learning →"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
