"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

export function FinalCTA() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (site.formspreeEndpoint.includes("REPLACE_ME")) {
      console.log(
        "Quote submission (demo mode):",
        Object.fromEntries(data.entries()),
      );
      setStatus("sent");
      form.reset();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(site.formspreeEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="quote"
      data-nav-theme="dark"
      className="section section-dark on-dark"
      style={{ overflow: "hidden", paddingBlock: "clamp(100px, 14vw, 180px)" }}
    >
      <div
        className="bloom bloom-dark"
        aria-hidden
        style={{ transform: "scale(1.4)" }}
      />
      <div
        className="wrap"
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="cta-copy"
        >
          <span className="eyebrow">Free estimate</span>
          <h2 style={{ marginTop: 20, maxWidth: "16ch" }}>
            Ready for a floor that gives{" "}
            <span className="italic-emph gradient-text">110%?</span>
          </h2>
          <p
            style={{
              marginTop: 24,
              color: "var(--muted-dark)",
              fontSize: 17,
              maxWidth: "46ch",
            }}
          >
            Share a few details and {site.owner} will reach out within one
            business day with next steps.
          </p>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <a
              href={site.phoneHref}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 16,
                color: "#fff",
              }}
            >
              <span
                className="expanded-label"
                style={{ color: "var(--muted-dark)", width: 56 }}
              >
                Call
              </span>
              <span className="font-display" style={{ fontSize: 22 }}>
                {site.phoneDisplay}
              </span>
            </a>
            <a
              href={`mailto:${site.email}`}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 16,
                color: "#fff",
              }}
            >
              <span
                className="expanded-label"
                style={{ color: "var(--muted-dark)", width: 56 }}
              >
                Email
              </span>
              <span className="font-display" style={{ fontSize: 22 }}>
                {site.email}
              </span>
            </a>
          </div>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          style={{
            background: "rgba(26, 26, 31, 0.6)",
            border: "1px solid var(--line-dark)",
            borderRadius: 24,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                className="font-display italic-emph gradient-text"
                style={{ fontSize: 48 }}
              >
                Got it.
              </div>
              <p style={{ marginTop: 12, color: "var(--muted-dark)" }}>
                {site.owner} will be in touch within one business day.
              </p>
            </div>
          ) : (
            <>
              <label className="field">
                <span>Name</span>
                <input name="name" required className="input" autoComplete="name" />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label className="field">
                  <span>Phone</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="input"
                    autoComplete="tel"
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="input"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className="field">
                <span>Project type</span>
                <select
                  name="service"
                  className="select"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a finish…
                  </option>
                  {site.finishes.map((f) => (
                    <option key={f.slug} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </label>
              <label className="field">
                <span>Square footage</span>
                <select name="size" className="select" defaultValue="">
                  <option value="" disabled>
                    Approximate size…
                  </option>
                  <option>Under 500 sq ft</option>
                  <option>500–1,500 sq ft</option>
                  <option>1,500–5,000 sq ft</option>
                  <option>5,000+ sq ft</option>
                </select>
              </label>
              <label className="field">
                <span>Tell us about the project</span>
                <textarea name="message" rows={4} className="textarea" />
              </label>
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-primary on-dark"
                style={{ marginTop: 6 }}
              >
                {status === "sending" ? "Sending…" : "Request my quote"}
                <ArrowRight size={16} strokeWidth={1.75} />
              </button>
              {status === "error" && (
                <p style={{ fontSize: 13, color: "var(--magenta)" }}>
                  Something went wrong. Call {site.phoneDisplay} and we&apos;ll
                  take it from there.
                </p>
              )}
              {site.formspreeEndpoint.includes("REPLACE_ME") && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted-dark)",
                    textAlign: "center",
                    letterSpacing: "0.1em",
                  }}
                >
                  Form in demo mode — add Formspree endpoint in /lib/site.ts to
                  go live.
                </p>
              )}
            </>
          )}
        </motion.form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #quote .wrap { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
