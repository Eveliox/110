"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { site } from "@/lib/site";
import { GoogleIcon } from "./GoogleIcon";

function Stars({ count }: { count: number }) {
  return (
    <div
      aria-label={`${count} out of 5 stars`}
      style={{
        display: "inline-flex",
        gap: 2,
        color: "var(--magenta)",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={16} strokeWidth={1.5} fill="currentColor" />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const { reviews, googleSummary } = site;

  return (
    <section
      data-nav-theme="light"
      className="section section-paper-2"
      id="reviews"
    >
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="eyebrow">What customers say</span>
            <h2 style={{ marginTop: 20, maxWidth: "14ch" }}>
              Five stars.
              <br />
              <span className="italic-emph gradient-text">On the floor.</span>
            </h2>
          </div>
          <a
            href={googleSummary.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 18px",
              borderRadius: 999,
              background: "#fff",
              border: "1px solid var(--line-light)",
              boxShadow: "0 2px 10px rgba(11,11,13,.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            aria-label={`See all ${googleSummary.count} Google reviews`}
          >
            <GoogleIcon size={24} />
            <span
              className="font-display"
              style={{
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              {googleSummary.rating.toFixed(1)}
            </span>
            <Stars count={5} />
            <span
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontWeight: 500,
              }}
            >
              ({googleSummary.count}) · Verified Google
            </span>
          </a>
        </motion.div>

        {googleSummary.placeholder && (
          <div
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,26,163,.1)",
              border: "1px solid rgba(255,26,163,.3)",
              fontSize: 11,
              color: "var(--magenta-2)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--magenta)",
              }}
            />
            Demo review data — swap for live Google Places feed
          </div>
        )}

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {reviews.map((r, i) => {
            const initial = r.author.charAt(0).toUpperCase();
            return (
              <motion.article
                key={`${r.author}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className="review-card"
                style={{
                  background: "#fff",
                  border: "1px solid var(--line-light)",
                  borderRadius: 20,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  position: "relative",
                }}
              >
                <header
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: r.avatarColor ?? "var(--ink)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.author}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {r.isLocalGuide && (
                        <>
                          <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                            Local Guide
                          </span>
                          <span style={{ margin: "0 6px" }}>·</span>
                        </>
                      )}
                      {r.timeAgo}
                    </div>
                  </div>
                  <Stars count={r.stars} />
                </header>

                <blockquote
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--ink)",
                  }}
                >
                  &ldquo;{r.text}&rdquo;
                </blockquote>

                {r.project && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "var(--paper-2)",
                      color: "var(--muted)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {r.project}
                  </span>
                )}

                <footer
                  style={{
                    marginTop: "auto",
                    paddingTop: 14,
                    borderTop: "1px solid var(--line-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <GoogleIcon size={14} />
                  <a
                    href={r.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Posted on Google
                  </a>
                </footer>
              </motion.article>
            );
          })}
        </div>
      </div>

      <style>{`
        .review-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .review-card:hover { box-shadow: 0 10px 30px rgba(11,11,13,.08); transform: translateY(-2px); }
      `}</style>
    </section>
  );
}
