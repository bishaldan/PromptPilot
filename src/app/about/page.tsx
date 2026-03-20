import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us - PromptPilot",
  description: "Learn about our mission to make AI education accessible for everyone.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── Public Navbar ── */}
      <nav className="public-navbar">
        <a href="/" className="public-navbar-brand">
          <span className="navbar-logo">✦</span>
          PromptPilot
        </a>
        <div className="public-nav-links">
          <a href="/explore" className="public-nav-link">Explore</a>
          <a href="/about" className="public-nav-link">About</a>
          <a href="/login" className="public-nav-link">Log in</a>
          <a href="/register" className="public-nav-link cta">Get Started</a>
        </div>
      </nav>

      {/* ── About Hero ── */}
      <section className="about-hero">
        <h1>About PromptPilot</h1>
        <p>
          We believe everyone deserves to understand and use AI, regardless of age,
          background, or technical skill. Our mission is to make AI education
          accessible, friendly, and practical.
        </p>
        <Image
          src="/images/about.png"
          alt="Our team collaborating on AI education"
          width={500}
          height={500}
          priority
          style={{ borderRadius: "20px" }}
        />
      </section>

      {/* ── Mission ── */}
      <section className="about-section alt">
        <div className="about-inner">
          <h2>Our Mission</h2>
          <p>
            AI is transforming how we work, learn, and communicate, but many people
            feel left behind. We built PromptPilot to change that. Our interactive,
            step-by-step lessons guide you through real AI tasks so you can learn
            by doing, not just reading.
          </p>
          <p>
            Whether you're a retired teacher discovering AI for the first time,
            a student looking to sharpen your skills, or a professional wanting to
            stay current, we've built this platform with you in mind.
          </p>
        </div>
      </section>

      {/* ── Why We Built This ── */}
      <section className="about-section">
        <div className="about-inner">
          <h2>Why We Built This</h2>
          <p>
            We noticed that most AI tutorials are written for technical audiences.
            They assume you already know programming or have experience with
            technology. We wanted to create something different, a platform where
            anyone can sit down and start learning AI tools immediately.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-section alt">
        <div className="about-inner">
          <h2>Our Values</h2>
          <p>Everything we build is guided by these core principles.</p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">♿</div>
              <h3>Accessibility First</h3>
              <p>Large text, clear navigation, and simple language. Our platform is designed for users of all ages and abilities.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Learning by Doing</h3>
              <p>Every lesson has you practice on the actual AI tool. We verify each step so you build real skills.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🆓</div>
              <h3>Free for Everyone</h3>
              <p>Education should never have a paywall. Our platform is completely free to use, always.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💛</div>
              <h3>Community Driven</h3>
              <p>We listen to our learners and continuously improve based on their feedback and needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Join Us Today</h2>
          <p>Start your AI learning journey right now. It takes less than a minute to sign up.</p>
          <Link href="/register">
            <button>Create Free Account →</button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">✦ PromptPilot</div>
            <p className="footer-desc">
              Making AI education accessible for everyone, regardless of age or experience.
            </p>
          </div>
          <div>
            <div className="footer-heading">Platform</div>
            <ul className="footer-links">
              <li><a href="/register">Get Started</a></li>
              <li><a href="/login">Log In</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Resources</div>
            <ul className="footer-links">
              <li><a href="/dashboard">Lessons</a></li>
              <li><a href="/about">Our Mission</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 PromptPilot. All rights reserved.
        </div>
      </footer>
    </>
  );
}
