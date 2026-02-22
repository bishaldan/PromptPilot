import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "Explore AI Courses - AI Auto Teaching Hub",
  description: "Discover our mission at AI Auto Teaching Hub. Browse our interactive AI courses including ChatGPT and Google Gemini. Master AI tools with guided, real-world practice.",
  keywords: ["AI education", "learn AI free", "ChatGPT course", "Google Gemini tutorial", "interactive learning platform", "AI for beginners"],
  openGraph: {
    title: "Explore Interactive AI Courses | AI Teaching Hub",
    description: "Learn how to use top AI tools like ChatGPT and Gemini with interactive, step-by-step lessons. Discover our mission to make AI accessible to everyone.",
    type: "website",
  },
};

const availableTools = [
  { slug: "chatgpt", name: "ChatGPT", description: "Master the world's most popular AI assistant. Learn prompt engineering, content generation, and data analysis.", icon: "💬" },
  { slug: "gemini", name: "Google Gemini", description: "Learn Google's powerful multimodal AI model. Explore its integration with Google Workspace and advanced reasoning.", icon: "✨" },
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
        <header style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1>Explore Our <span className="highlight">Platform & Courses</span></h1>
          <p className="hero-subtitle" style={{ maxWidth: "700px", margin: "1.5rem auto 0" }}>
            The AI Auto Teaching Hub is dedicated to making artificial intelligence accessible to everyone. 
            Discover how our interactive approach helps you build practical AI skills from day one.
          </p>
        </header>

        {/* Mission Section */}
        <section className="panel" style={{ marginBottom: "4rem", padding: "3rem", background: "var(--bg-soft)" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "2rem" }}>What This Website Is All About</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
            Artificial Intelligence is transforming the world, but many people are left behind because traditional tutorials can be confusing or passive. 
            <strong> The AI Auto Teaching Hub </strong> was created with a single mission: to provide a hands-on, zero-intimidation environment where anyone—regardless of age or technical background—can learn to use AI tools effectively.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-primary)" }}>
            We believe that you learn best by doing. Instead of just reading text or watching videos, our platform puts you in the driver's seat. 
            You practice exactly how to prompt, converse, and evaluate AI outputs in real-time.
          </p>
        </section>

        {/* Offerings Section */}
        <section style={{ marginBottom: "5rem" }}>
          <h2 style={{ textAlign: "center", marginBottom: "3rem", fontSize: "2rem" }}>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Interactive Step-by-Step Lessons</h3>
              <p>No more guessing. Our lessons guide you through exact tasks, explaining the "why" and "how" of each action you take with an AI tool.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Real-Time Verification</h3>
              <p>Using our companion Chrome extension, the platform verifies your actions. You only progress when you correctly execute the AI task, guaranteeing mastery.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏅</div>
              <h3>Progress & Badges</h3>
              <p>Stay motivated by earning badges and tracking your learning journey across different difficulty levels and toolsets.</p>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <h2 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2rem" }}>Available AI Courses</h2>
          <div className="card-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {availableTools.map((tool) => {
              const bgGradient = tool.slug === "chatgpt" 
                ? "linear-gradient(135deg, #10a37f 0%, #0d8265 100%)"
                : tool.slug === "gemini" 
                ? "linear-gradient(135deg, #1a73e8 0%, #8ab4f8 100%)"
                : "var(--panel)";
              const isColored = tool.slug === "chatgpt" || tool.slug === "gemini";

              return (
                <article key={tool.slug} className="panel course-card colored-card" style={{ 
                  background: isColored ? bgGradient : 'var(--panel)',
                  color: isColored ? '#fff' : 'inherit',
                  border: 'none',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div className="course-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="course-card-icon" style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '16px', 
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {['chatgpt', 'gemini'].includes(tool.slug) ? (
                        <Image 
                          src={`/images/logos/${tool.slug}.svg`} 
                          alt={`${tool.name} logo`} 
                          width={48} 
                          height={48}
                          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
                        />
                      ) : (
                        <span style={{ fontSize: '2.5rem' }}>{tool.icon}</span>
                      )}
                    </div>
                    <span className="course-tag" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: "16px", fontWeight: "bold", fontSize: "0.85rem", backdropFilter: 'blur(4px)' }}>
                      Interactive
                    </span>
                  </div>
                  <div className="course-card-title">
                    <h3 style={{ fontSize: "1.75rem", marginBottom: "0.75rem", color: isColored ? '#fff' : 'var(--text-primary)' }}>Master {tool.name}</h3>
                  </div>
                  <p style={{ color: isColored ? 'rgba(255,255,255,0.85)' : 'var(--muted)', margin: "1rem 0", lineHeight: 1.5, minHeight: "60px", fontSize: '1.05rem', flexGrow: 1 }}>
                    {tool.description}
                  </p>
                  <div style={{ marginTop: "1.5rem" }}>
                    <Link href="/register">
                      <button className="primary" style={{ 
                        width: "100%", 
                        background: isColored ? 'var(--bg)' : 'var(--accent)', 
                        color: isColored ? 'var(--text-primary)' : '#fff',
                        border: isColored ? '1px solid rgba(0,0,0,0.1)' : 'none',
                        boxShadow: isColored ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
                        padding: '1rem',
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        borderRadius: '12px'
                      }}>Start Learning Free</button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: "5rem", padding: "4rem 2rem", background: "var(--accent-gradient)", borderRadius: "24px", color: "white" }}>
           <h2 style={{ marginBottom: "1rem", color: "white" }}>Ready to master the future?</h2>
           <p style={{ marginBottom: "2rem", fontSize: "1.1rem", opacity: 0.9 }}>Join thousands of learners building practical AI skills today.</p>
           <Link href="/register">
             <button style={{ background: "white", color: "var(--accent)", fontSize: "1.1rem", padding: "1rem 2.5rem", borderRadius: "50px", fontWeight: "bold", border: "none", cursor: "pointer", transition: "transform 0.2s" }} className="hover-scale">
               Create Your Free Account
             </button>
           </Link>
        </div>
      </main>
    </>
  );
}
