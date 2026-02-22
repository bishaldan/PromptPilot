import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      {/* ── Public Navbar ── */}
      <nav className="public-navbar">
        <a href="/" className="public-navbar-brand">
          <span className="navbar-logo">✦</span>
          AI Teaching Hub
        </a>
        <div className="public-nav-links">
          <a href="/about" className="public-nav-link">About</a>
          <a href="/login" className="public-nav-link">Log in</a>
          <a href="/register" className="public-nav-link cta">Get Started</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">🎓 Free AI Learning Platform</span>
            <h1>
              Learn AI Tools<br />
              with <span className="highlight">Guided Practice</span>
            </h1>
            <p className="hero-subtitle">
              Master Google Gemini and other AI tools through step-by-step interactive lessons.
              No experience needed — perfect for beginners of all ages.
            </p>
            <div className="hero-buttons">
              <Link href="/register">
                <button className="primary">Start Learning Free →</button>
              </Link>
              <Link href="/about">
                <button className="outline-btn">Learn More</button>
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>10+</strong>
                <span>Lessons</span>
              </div>
              <div className="hero-stat">
                <strong>100%</strong>
                <span>Free</span>
              </div>
              <div className="hero-stat">
                <strong>All Ages</strong>
                <span>Welcome</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/images/hero.png"
              alt="People of all ages learning AI tools together"
              width={520}
              height={520}
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <h2>Everything You Need to Learn AI</h2>
            <p>Our platform makes learning AI tools simple, fun, and accessible for everyone.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Interactive Lessons</h3>
              <p>Follow step-by-step guides that walk you through real AI tasks. Each step is verified so you learn by doing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Earn Badges</h3>
              <p>Complete lessons to earn badges and track your progress. See how far you've come on your learning journey.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Multiple AI Tools</h3>
              <p>Learn Google Gemini and more. We're always adding new AI tools so you stay ahead of the curve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just three simple steps. No complicated setup required.</p>
          </div>
          <div className="steps-row">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up for free in under a minute. Just your name, email, and a password.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Pick a Lesson</h3>
              <p>Browse our library and choose a lesson that interests you. Lessons are sorted by difficulty.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Practice & Learn</h3>
              <p>Follow the guided steps directly on the AI tool. We verify each step so you know you're on track.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>What Our Learners Say</h2>
            <p>People of all ages are discovering the power of AI through our platform.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"I'm 67 years old and was terrified of AI. This platform made it so easy to understand. Now I use Gemini every day!"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MR</div>
                <div>
                  <div className="testimonial-name">Margaret R.</div>
                  <div className="testimonial-role">Retired Teacher</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The step-by-step approach is brilliant. I actually learn by doing instead of just reading. The badges keep me motivated!"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">JK</div>
                <div>
                  <div className="testimonial-name">James K.</div>
                  <div className="testimonial-role">Small Business Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"I recommended this to my parents and they love it. The interface is clean and the lessons are very clear and simple."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SP</div>
                <div>
                  <div className="testimonial-name">Sarah P.</div>
                  <div className="testimonial-role">University Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to Start Learning?</h2>
          <p>Join our community and master AI tools at your own pace. It's completely free.</p>
          <Link href="/register">
            <button>Create Free Account →</button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">✦ AI Teaching Hub</div>
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
          © 2026 AI Teaching Hub. All rights reserved.
        </div>
      </footer>
    </>
  );
}
