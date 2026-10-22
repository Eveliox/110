"use client";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { HeroMedia } from "./HeroMedia";

export function Hero() {
  return (
    <section
      id="top"
      data-nav-theme="light"
      className="section section-light"
      style={{
        paddingBlock: "clamp(60px, 8vw, 120px)",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <div className="bloom" aria-hidden />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 32,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          <div style={{ gridColumn: "span 7" }} className="hero-copy">
            <span className="eyebrow">
              Residential &amp; Commercial Floor Coatings
            </span>
            <h1 style={{ marginTop: 24, position: "relative" }}>
              <span className="headline-glow" aria-hidden />
              Floors built
              <br />
              to give{" "}
              <span className="italic-emph gradient-text">110%.</span>
            </h1>
            <p
              style={{
                marginTop: 24,
                maxWidth: "48ch",
                color: "var(--muted)",
                fontSize: 18,
              }}
            >
              Epoxy, flake, metallic, and polished concrete finishes —
              engineered to last and designed to impress.
            </p>
            <div
              style={{
                marginTop: 32,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <a href="#quote" className="btn btn-primary">
                Get a Free Quote
                <ArrowRight size={16} strokeWidth={1.75} />
              </a>
              <a href="#work" className="btn btn-ghost">
                See Our Work
                <ArrowUpRight size={16} strokeWidth={1.75} />
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            style={{ gridColumn: "span 5" }}
            className="hero-visual"
          >
            <HeroMedia
              poster={site.hero.poster}
              video={site.hero.video}
              videoWebm={site.hero.videoWebm}
              alt={site.hero.alt}
              chip={site.hero.chip}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="wrap" style={{ marginTop: 72 }}>
        <div className="trust-strip">
          <ul className="expanded-label">
            {site.trustStrip.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .headline-glow {
          position: absolute;
          left: 0;
          bottom: -20px;
          width: 60%;
          height: 60%;
          pointer-events: none;
          background: radial-gradient(
            50% 60% at 30% 70%,
            rgba(255, 26, 163, 0.35) 0%,
            rgba(123, 44, 245, 0.18) 45%,
            transparent 75%
          );
          filter: blur(48px);
          z-index: -1;
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-copy, .hero-visual { grid-column: span 1 !important; }
          .hero-visual { max-width: 480px; margin-inline: auto; width: 100%; }
        }
      `}</style>
    </section>
  );
}
