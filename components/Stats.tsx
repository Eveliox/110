"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";
import { site, type Stat as StatType } from "@/lib/site";

function parseDisplay(display: string): {
  prefix: string;
  numeric: string;
  suffix: string;
  isDecimal: boolean;
} {
  const match = display.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", numeric: display, suffix: "", isDecimal: false };
  return {
    prefix: match[1] ?? "",
    numeric: match[2] ?? "",
    suffix: match[3] ?? "",
    isDecimal: (match[2] ?? "").includes("."),
  };
}

function useCount(target: number, isDecimal: boolean, inView: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const settle = () => {
      if (cancelled) return;
      setN(isDecimal ? Math.round(target * 10) / 10 : target);
    };
    if (prefersReduced) {
      queueMicrotask(settle);
      return () => {
        cancelled = true;
      };
    }
    const tick = (t: number) => {
      if (cancelled) return;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const raw = target * eased;
      setN(isDecimal ? Math.round(raw * 10) / 10 : Math.round(raw));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [inView, target, duration, isDecimal]);
  return n;
}

function formatNumber(n: number, isDecimal: boolean): string {
  if (isDecimal) return n.toFixed(1);
  return new Intl.NumberFormat("en-US").format(n);
}

function Stat({
  stat,
  inView,
  size = "default",
}: {
  stat: StatType;
  inView: boolean;
  size?: "default" | "large";
}) {
  const parsed = parseDisplay(stat.display);
  const target = parseFloat(parsed.numeric) || stat.value;
  const n = useCount(target, parsed.isDecimal, inView);
  const numberSize =
    size === "large" ? "clamp(4rem, 10vw, 8rem)" : "clamp(3rem, 7vw, 6rem)";
  return (
    <div style={{ position: "relative" }}>
      <div
        className="font-display italic-emph"
        style={{
          fontSize: numberSize,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          display: "inline-flex",
          alignItems: "baseline",
        }}
      >
        {parsed.prefix && <span>{parsed.prefix}</span>}
        <span>{formatNumber(n, parsed.isDecimal)}</span>
        {parsed.suffix && (
          <span style={{ fontSize: "0.5em", marginLeft: "0.04em" }}>
            {parsed.suffix}
          </span>
        )}
      </div>
      <div
        aria-hidden
        style={{
          marginTop: 12,
          width: size === "large" ? 32 : 24,
          height: 2,
          background: "linear-gradient(100deg, var(--magenta), var(--violet))",
          borderRadius: 2,
        }}
      />
      <div
        className="expanded-label"
        style={{ marginTop: 12, color: "var(--muted-dark)" }}
      >
        {stat.label}
      </div>
      {stat.sub && (
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "rgba(161,161,170,0.7)",
            maxWidth: "22ch",
          }}
        >
          {stat.sub}
        </div>
      )}
      {stat.placeholder && (
        <div
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(255, 26, 163, 0.12)",
            fontSize: 9,
            color: "var(--magenta)",
            letterSpacing: "0.18em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--magenta)",
            }}
          />
          Needs real number
        </div>
      )}
    </div>
  );
}

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const stats = site.stats;
  const isThree = stats.length === 3;

  return (
    <section
      ref={ref}
      data-nav-theme="dark"
      className="section section-dark on-dark"
      style={{ overflow: "hidden" }}
    >
      <div className="bloom bloom-dark" aria-hidden />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {isThree ? (
            <div
              className="stats-three"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 48,
                alignItems: "end",
              }}
            >
              <Stat stat={stats[0]} inView={inView} />
              <Stat stat={stats[1]} inView={inView} size="large" />
              <Stat stat={stats[2]} inView={inView} />
            </div>
          ) : (
            <div
              className="stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                gap: 48,
              }}
            >
              {stats.map((s) => (
                <Stat key={s.label} stat={s} inView={inView} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
          .stats-three { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
