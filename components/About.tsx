"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Wrench, Users } from "lucide-react";
import { site } from "@/lib/site";

const points = [
  { icon: ShieldCheck, label: "Licensed & insured" },
  { icon: Wrench, label: "Written workmanship warranty" },
  { icon: Users, label: "Owner on-site, every job" },
];

export function About() {
  return (
    <section
      id="about"
      data-nav-theme="light"
      className="section section-light"
    >
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "5fr 7fr",
            gap: 64,
            alignItems: "center",
          }}
          className="about-grid"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              aspectRatio: "4 / 5",
              background: "var(--paper-2)",
            }}
          >
            <Image
              src={site.aboutImage}
              alt={`Finished work by ${site.owner}`}
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              style={{
                objectFit: "cover",
                filter: "contrast(1.05) saturate(1.03)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <span className="eyebrow">About the crew</span>
            <h2 style={{ marginTop: 20, maxWidth: "16ch" }}>
              {site.owner} runs{" "}
              <span className="italic-emph gradient-text">every job.</span>
            </h2>
            <p
              style={{
                marginTop: 24,
                color: "var(--muted)",
                fontSize: 17,
                maxWidth: "52ch",
              }}
            >
              {site.name} started with one truck, one grinder, and a rule:
              prep the slab right or don&apos;t take the job.{" "}
              {site.yearsInBusiness} years later, that&apos;s still the rule.
              Every quote comes from {site.owner} directly, and every pour has
              the owner on-site.
            </p>

            <ul
              style={{
                marginTop: 32,
                display: "grid",
                gap: 14,
                listStyle: "none",
                padding: 0,
              }}
            >
              {points.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 15,
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--paper-2)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink)",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <a
              href="#quote"
              className="btn btn-primary"
              style={{ marginTop: 32 }}
            >
              Start your project
              <ArrowRight size={16} strokeWidth={1.75} />
            </a>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
