"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserInfo = { email: string; displayName?: string; role?: string };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({
            email: data.user.email || "",
            displayName: data.user.displayName ?? undefined,
            role: data.user.role ?? "user",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide navbar on public pages — AFTER all hooks
  const publicPages = ["/", "/login", "/register", "/welcome", "/about"];
  if (publicPages.includes(pathname)) return null;

  function handleLogout() {
    document.cookie = "session_token=; path=/; max-age=0";
    router.push("/login");
  }

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/dashboard" className="navbar-brand">
          <span className="navbar-logo">✦</span>
          <span className="navbar-title">AI Teaching Hub</span>
        </a>
      </div>

      <div className="navbar-center">
        <a href="/dashboard" className={`navbar-link ${pathname === "/dashboard" ? "active" : ""}`}>
          Dashboard
        </a>
        <a href="/about" className={`navbar-link ${pathname === "/about" ? "active" : ""}`}>
          About
        </a>
        {user?.role === "admin" && (
          <a href="/admin" className={`navbar-link ${pathname.startsWith("/admin") ? "active" : ""}`}>
            Admin
          </a>
        )}
      </div>

      <div className="navbar-right" ref={menuRef}>
        <button className="navbar-avatar" onClick={() => setMenuOpen(!menuOpen)} title="Account">
          {initials}
        </button>
        {menuOpen && (
          <div className="navbar-dropdown">
            <div className="navbar-dropdown-header">
              <strong>{user?.displayName || "User"}</strong>
              <span className="muted">{user?.email}</span>
            </div>
            <hr className="navbar-divider" />
            <a href="/profile" className="navbar-dropdown-item">
              Profile & Stats
            </a>
            {user?.role === "admin" && (
              <a href="/admin" className="navbar-dropdown-item">
                Admin Panel
              </a>
            )}
            <hr className="navbar-divider" />
            <button className="navbar-dropdown-item logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
