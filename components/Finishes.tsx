"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

export function Finishes() {
  return (
    <section
      id="finishes"
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
          <span className="eyebrow">01 / Finishes</span>
          <h2 style={{ marginTop: 20, maxWidth: "14ch" }}>
            Pick your <span className="italic-emph gradient-text">finish.</span>
          </h2>
        </motion.div>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {site.finishes.map((f, i) => (
            <motion.article
              key={f.slug}
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <div className="card-img">
                <Image
                  src={f.image}
                  alt={`${f.name} floor by 110% Coatings`}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ filter: "contrast(1.05) saturate(1.03)" }}
                />
                <span className="card-index">0{i + 1} / {f.name}</span>
                {f.imageNeedsReplacement && (
                  <span className="card-needs-photo">
                    Needs finished-floor photo
                  </span>
                )}
              </div>
              <div style={{ padding: 24 }}>
                <h3 className="font-display" style={{ fontSize: 24 }}>
                  {f.name}
                </h3>
                <p
                  style={{
                    marginTop: 10,
                    color: "var(--muted)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  {f.blurb}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {f.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/finishes/${f.slug}`}
                  style={{
                    marginTop: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  See the floor
                  <ArrowRight size={14} strokeWidth={1.75} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <style>{`
        .card-index {
          position: absolute;
          top: 12px;
          left: 12px;
          font-family: var(--font-display);
          font-variation-settings: "wdth" 125;
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #fff;
          background: rgba(11, 11, 13, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 6px 10px;
          border-radius: 999px;
          z-index: 1;
        }
        .card-needs-photo {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: var(--magenta);
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          z-index: 1;
        }
      `}</style>
    </section>
  );
}
