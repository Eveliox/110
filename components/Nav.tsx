"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/#finishes", label: "Finishes" },
  { href: "/work", label: "Work" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "About" },
];

type Theme = "light" | "dark";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    );
    if (sections.length === 0) return;

    const navHeight = 72;

    const update = () => {
      const probe = navHeight + 8;
      let current: Theme = "light";
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom > probe) {
          current = (el.dataset.navTheme as Theme) || "light";
          break;
        }
      }
      setTheme(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isDark = theme === "dark";
  const barBg = scrolled
    ? isDark
      ? "rgba(11, 11, 13, 0.78)"
      : "rgba(242, 240, 237, 0.82)"
    : isDark
      ? "rgba(11, 11, 13, 0.35)"
      : "rgba(242, 240, 237, 0.35)";
  const borderColor = scrolled
    ? isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(11,11,13,0.08)"
    : "transparent";
  const linkColor = isDark ? "#FFFFFF" : "#0B0B0D";

  return (
    <header
      className={isDark ? "on-dark" : ""}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "var(--nav-h)",
        display: "flex",
        alignItems: "center",
        background: barBg,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${borderColor}`,
        transition:
          "background 240ms ease, border-color 240ms ease, color 180ms ease",
        color: linkColor,
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          width: "100%",
        }}
      >
        <Link
          href="/"
          aria-label="110% Coatings home"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-grid",
              gridTemplateAreas: "stack",
            }}
          >
            <span
              style={{
                gridArea: "stack",
                opacity: isDark ? 0 : 1,
                transition: "opacity 180ms ease",
              }}
            >
              <Logo variant="dark" size="sm" />
            </span>
            <span
              style={{
                gridArea: "stack",
                opacity: isDark ? 1 : 0,
                transition: "opacity 180ms ease",
              }}
            >
              <Logo variant="light" size="sm" />
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="nav-desktop">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: linkColor,
                whiteSpace: "nowrap",
                transition: "color 180ms ease",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-desktop">
          <Link href="/#quote" className="btn btn-primary">
            Get a Quote
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open menu"
          className="nav-mobile"
          style={{ padding: 8, color: linkColor }}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="mobile-panel on-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="bloom bloom-dark" aria-hidden />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: 8,
              color: "#fff",
            }}
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          <nav
            aria-label="Mobile"
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display italic-emph"
                style={{ fontSize: 44, color: "#fff" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
            <Link
              href="/#quote"
              onClick={() => setOpen(false)}
              className="btn btn-primary on-dark"
              style={{ flex: 1 }}
            >
              Get a Quote
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex; align-items: center; gap: 32px; }
        .nav-mobile { display: none; }
        @media (max-width: 900px) {
          .nav-desktop { display: none; }
          .nav-mobile { display: inline-flex; }
        }
      `}</style>
    </header>
  );
}
