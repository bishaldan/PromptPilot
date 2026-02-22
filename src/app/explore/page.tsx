import Link from "next/link";
import Image from "next/image";
import { COURSE_NAMES } from "@/app/dashboard/page"; // We can reuse or duplicate the course mapping

// Define metadata for SEO
export const metadata = {
  title: "Explore AI Courses - AI Auto Teaching Hub",
  description: "Browse our interactive AI courses, including ChatGPT, Google Gemini, and more. Learn AI tools with guided practice.",
};

// Instead of hitting the DB on the "public" marketing page directly,
// we can define the available tools to showcase. 
// A more robust implementation would fetch these statically or use a public API route.
const availableTools = [
  { slug: "chatgpt", name: "ChatGPT", description: "Master the world's most popular AI assistant.", icon: "💬" },
  { slug: "gemini", name: "Google Gemini", description: "Learn Google's powerful multimodal AI model.", icon: "✨" },
  // Add other tools as needed
];

export default function ExplorePage() {
  return (
    <>
      <nav className="public-navbar">
        <Link href="/" className="public-navbar-brand">
          <span className="navbar-logo">✦</span>
          AI Teaching Hub
        </Link>
        <div className="public-nav-links">
          <Link href="/explore" className="public-nav-link" style={{ fontWeight: 600, color: 'var(--accent)' }}>Explore</Link>
          <Link href="/about" className="public-nav-link">About</Link>
          <Link href="/login" className="public-nav-link">Log in</Link>
          <Link href="/register" className="public-nav-link cta">Get Started</Link>
        </div>
      </nav>

      <main className="main-wrap">
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1>Explore Our Interactive <span className="highlight">AI Courses</span></h1>
          <p className="hero-subtitle" style={{ maxWidth: "600px", margin: "1rem auto 0" }}>
            Discover tools to enhance your productivity, creativity, and learning. Start for free today.
          </p>
        </header>

        <section className="card-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {availableTools.map((tool) => (
            <article key={tool.slug} className="panel course-card">
              <div className="course-card-header">
                {['chatgpt', 'gemini'].includes(tool.slug) ? (
                  <div className="course-card-icon" style={{ background: 'transparent' }}>
                    <Image 
                      src={`/images/logos/${tool.slug}.svg`} 
                      alt={`${tool.name} logo`} 
                      width={48} 
                      height={48} 
                    />
                  </div>
                ) : (
                  <div className="course-card-icon">{tool.icon}</div>
                )}
                <div className="course-card-title">
                  <h2>{COURSE_NAMES[tool.slug] || tool.name}</h2>
                  <span className="course-tag">Interactive</span>
                </div>
              </div>
              <p style={{ color: "var(--muted)", margin: "1rem 0", lineHeight: 1.5 }}>
                {tool.description}
              </p>
              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/register">
                  <button className="primary" style={{ width: "100%" }}>Start Learning</button>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <div style={{ textAlign: "center", marginTop: "4rem" }}>
           <h2 style={{ marginBottom: "1rem" }}>Ready to master AI tools?</h2>
           <Link href="/register">
             <button className="primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>Create Your Free Account</button>
           </Link>
        </div>
      </main>
    </>
  );
}
