"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { site, type WorkItem } from "@/lib/site";
import { BeforeAfter } from "./BeforeAfter";

const filters = [
  { key: "all", label: "All" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

type Tile =
  | { kind: "work"; item: WorkItem; colSpan: number; aspect: string }
  | {
      kind: "ba";
      item: (typeof site.beforeAfters)[number];
      colSpan: number;
      aspect: string;
    };

const bentoLayouts: Record<number, { spans: number[]; aspects: string[] }> = {
  1: { spans: [12], aspects: ["16 / 9"] },
  2: {
    spans: [7, 5],
    aspects: ["4 / 3", "4 / 3"],
  },
  3: {
    spans: [8, 4, 12],
    aspects: ["16 / 10", "4 / 5", "21 / 9"],
  },
  4: {
    spans: [7, 5, 5, 7],
    aspects: ["4 / 3", "4 / 3", "4 / 3", "4 / 3"],
  },
  5: {
    spans: [7, 5, 4, 4, 4],
    aspects: ["4 / 3", "4 / 3", "4 / 3", "4 / 3", "4 / 3"],
  },
  6: {
    spans: [8, 4, 4, 8, 6, 6],
    aspects: ["16 / 10", "4 / 5", "4 / 5", "16 / 10", "4 / 3", "4 / 3"],
  },
  7: {
    spans: [8, 4, 4, 8, 4, 4, 4],
    aspects: ["16 / 10", "4 / 5", "4 / 5", "16 / 10", "4 / 3", "4 / 3", "4 / 3"],
  },
  8: {
    spans: [8, 4, 4, 8, 6, 6, 6, 6],
    aspects: [
      "16 / 10",
      "4 / 5",
      "4 / 5",
      "16 / 10",
      "4 / 3",
      "4 / 3",
      "4 / 3",
      "4 / 3",
    ],
  },
};

function layoutFor(n: number) {
  if (n <= 0) return { spans: [], aspects: [] };
  if (n <= 8) return bentoLayouts[n];
  const base = bentoLayouts[8];
  const extraRows = Math.ceil((n - 8) / 2);
  const extras = Array.from({ length: extraRows * 2 }, () => ({
    span: 6,
    aspect: "4 / 3",
  }));
  return {
    spans: [...base.spans, ...extras.map((e) => e.span)].slice(0, n),
    aspects: [...base.aspects, ...extras.map((e) => e.aspect)].slice(0, n),
  };
}

export function SelectedWork() {
  const [active, setActive] = useState<FilterKey>("all");

  const tiles = useMemo<Tile[]>(() => {
    const items =
      active === "all"
        ? site.work
        : site.work.filter((w) => w.category === active);

    const ba = site.beforeAfters[0];
    const includeBa = Boolean(ba) && items.length >= 3;
    const totalCount = items.length + (includeBa ? 1 : 0);
    const { spans, aspects } = layoutFor(totalCount);

    const built: Tile[] = [];
    let workIdx = 0;
    for (let i = 0; i < totalCount; i++) {
      const span = spans[i] ?? 6;
      const aspect = aspects[i] ?? "4 / 3";
      // Place the before/after at position 3 (4th tile) for 6+ counts, else at the end
      const baSlot = totalCount >= 6 ? 3 : totalCount - 1;
      if (includeBa && i === baSlot) {
        built.push({ kind: "ba", item: ba, colSpan: span, aspect });
      } else {
        const item = items[workIdx++];
        if (!item) continue;
        built.push({ kind: "work", item, colSpan: span, aspect });
      }
    }
    return built;
  }, [active]);

  return (
    <section
      id="work"
      data-nav-theme="dark"
      className="section section-dark on-dark"
      style={{ overflow: "hidden" }}
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
            <span className="eyebrow">02 / Selected Work</span>
            <h2 style={{ marginTop: 20, maxWidth: "14ch" }}>
              Recent{" "}
              <span className="italic-emph gradient-text">projects.</span>
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              role="tablist"
              aria-label="Work filters"
              style={{ display: "flex", gap: 10 }}
            >
              {filters.map((f) => {
                const isActive = f.key === active;
                return (
                  <button
                    key={f.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(f.key)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 500,
                      color: isActive ? "#fff" : "var(--muted-dark)",
                      background: isActive
                        ? "linear-gradient(100deg, var(--magenta), var(--violet))"
                        : "transparent",
                      border: isActive
                        ? "1px solid transparent"
                        : "1px solid var(--line-dark)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <Link
              href="/work"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                paddingBottom: 2,
              }}
            >
              View all projects
              <ArrowUpRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </motion.div>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 20,
          }}
          className="work-grid"
        >
          <AnimatePresence mode="popLayout">
            {tiles.map((tile, i) => (
              <motion.div
                key={
                  tile.kind === "work"
                    ? `w-${tile.item.src}`
                    : `ba-${tile.item.after}`
                }
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.04 }}
                style={{ gridColumn: `span ${tile.colSpan}` }}
                className="work-cell"
              >
                {tile.kind === "work" ? (
                  <figure
                    className="work-tile"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 20,
                      aspectRatio: tile.aspect,
                      background: "var(--ink-2)",
                      margin: 0,
                    }}
                  >
                    <Image
                      src={tile.item.src}
                      alt={tile.item.alt}
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      style={{
                        objectFit: "cover",
                        filter: "contrast(1.08) saturate(1.05)",
                        transition: "transform 0.6s ease",
                      }}
                    />
                    <div className="work-overlay" aria-hidden />
                    <figcaption className="work-caption">
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {tile.item.space}
                      </span>
                      <span
                        className="expanded-label"
                        style={{ color: "var(--muted-dark)" }}
                      >
                        {tile.item.finish}
                      </span>
                    </figcaption>
                  </figure>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 20,
                      overflow: "hidden",
                      aspectRatio: tile.aspect,
                    }}
                  >
                    <BeforeAfter
                      before={tile.item.before}
                      after={tile.item.after}
                      label={tile.item.label}
                      finish={tile.item.finish}
                      aspect={tile.aspect}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .work-tile .work-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(11,11,13,0.75) 100%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .work-tile .work-caption {
          position: absolute; left: 20px; right: 20px; bottom: 20px;
          display: flex; justify-content: space-between; align-items: end; color: #fff;
          transform: translateY(8px); opacity: 0; transition: all 0.3s ease;
        }
        .work-tile:hover img { transform: scale(1.04); }
        .work-tile:hover .work-overlay { opacity: 1; }
        .work-tile:hover .work-caption,
        .work-tile:focus-within .work-caption { opacity: 1; transform: translateY(0); }
        @media (max-width: 760px) {
          .work-grid > .work-cell { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </section>
  );
}
