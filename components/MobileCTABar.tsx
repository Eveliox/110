"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/lib/site";

export function MobileCTABar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const quote = document.getElementById("quote");
    if (!hero && !quote) return;

    let pastHero = false;
    let overQuote = false;

    const updateVisible = () => {
      setVisible(pastHero && !overQuote);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id === "top") {
            pastHero = !entry.isIntersecting;
          } else if (entry.target.id === "quote") {
            overQuote = entry.isIntersecting;
          }
        }
        updateVisible();
      },
      { threshold: 0.1 },
    );

    if (hero) observer.observe(hero);
    if (quote) observer.observe(quote);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className="mobile-cta-bar"
        role="region"
        aria-label="Quick contact"
        aria-hidden={!visible}
        style={{
          transform: visible ? "translateY(0)" : "translateY(110%)",
        }}
      >
        <a
          href={site.phoneHref}
          className="mobile-cta-btn mobile-cta-ghost"
          aria-label={`Call ${site.phoneDisplay}`}
        >
          <Phone size={18} strokeWidth={1.75} />
          <span>Call</span>
        </a>
        <a
          href="#quote"
          className="mobile-cta-btn mobile-cta-primary"
        >
          <span>Free Quote</span>
          <ArrowRight size={16} strokeWidth={1.75} />
        </a>
      </div>

      <style>{`
        .mobile-cta-bar {
          display: none;
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 40;
          padding: 12px 16px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom));
          gap: 8px;
          background: rgba(11,11,13,.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(255,255,255,.1);
          transition: transform 240ms ease;
        }
        .mobile-cta-btn {
          flex: 1;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .mobile-cta-ghost {
          color: #fff;
          background: transparent;
          border: 1px solid rgba(255,255,255,.4);
        }
        .mobile-cta-ghost:active { background: rgba(255,255,255,.08); }
        .mobile-cta-primary {
          color: var(--ink);
          background: #fff;
        }
        .mobile-cta-primary:active {
          background: linear-gradient(100deg, var(--magenta), var(--violet));
          color: #fff;
        }
        @media (max-width: 760px) {
          .mobile-cta-bar { display: flex; }
          body { padding-bottom: calc(76px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
}
