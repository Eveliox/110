"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { site } from "@/lib/site";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [progress, setProgress] = useState("0%");

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(() => setProgress("80%"), 0);
    return () => window.clearTimeout(id);
  }, [inView]);

  return (
    <section
      id="process"
      data-nav-theme="light"
      className="section section-light"
    >
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="eyebrow">03 / Process</span>
          <h2 style={{ marginTop: 20, maxWidth: "18ch" }}>
            From bare concrete to{" "}
            <span className="italic-emph gradient-text">flawless.</span>
          </h2>
        </motion.div>

        <div
          ref={ref}
          className="process-row"
          style={
            {
              marginTop: 72,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
              ["--progress" as string]: progress,
            } as React.CSSProperties
          }
        >
          {site.process.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              style={{ position: "relative", zIndex: 2 }}
              className="process-step"
            >
              <div
                className="font-display italic-emph"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  border: "1px solid var(--line-light)",
                  background: "var(--paper)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "var(--ink)",
                }}
              >
                {p.n}
              </div>
              <h3
                style={{
                  marginTop: 24,
                  fontSize: 22,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  marginTop: 10,
                  color: "var(--muted)",
                  fontSize: 15,
                }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .process-row { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
