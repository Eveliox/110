"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { site } from "@/lib/site";

type SpaceKey = "all" | "garage" | "basement" | "showroom" | "retail" | "lobby" | "great-room";
type FinishKey = "all" | "Epoxy Flake" | "Metallic Epoxy" | "Polished Concrete";
type Sort = "newest" | "popular";

const spaceFilters: { key: SpaceKey; label: string; match?: string }[] = [
  { key: "all", label: "All spaces" },
  { key: "garage", label: "Garage", match: "Garage" },
  { key: "basement", label: "Basement", match: "Basement" },
  { key: "great-room", label: "Great room", match: "Great room" },
  { key: "showroom", label: "Showroom", match: "Showroom" },
  { key: "retail", label: "Retail", match: "Retail" },
  { key: "lobby", label: "Lobby", match: "Lobby" },
];

const finishFilters: { key: FinishKey; label: string }[] = [
  { key: "all", label: "All finishes" },
  { key: "Epoxy Flake", label: "Epoxy Flake" },
  { key: "Metallic Epoxy", label: "Metallic Epoxy" },
  { key: "Polished Concrete", label: "Polished Concrete" },
];

export function WorkGallery() {
  const [space, setSpace] = useState<SpaceKey>("all");
  const [finish, setFinish] = useState<FinishKey>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(() => {
    const filtered = site.work.filter((w) => {
      if (finish !== "all" && w.finish !== finish) return false;
      if (space !== "all") {
        const match = spaceFilters.find((s) => s.key === space)?.match;
        if (!match || !w.space.includes(match)) return false;
      }
      return true;
    });
    if (sort === "popular") {
      return [...filtered].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
    }
    return filtered;
  }, [space, finish, sort]);

  const activeCount = items.length;
  const anyFilter = space !== "all" || finish !== "all";

  return (
    <>
      <section
        data-nav-theme="light"
        className="section section-light"
        style={{ paddingBottom: "clamp(32px, 4vw, 56px)" }}
      >
        <div className="wrap">
          <span className="eyebrow">The archive</span>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            <h1 style={{ maxWidth: "14ch" }}>
              The <span className="italic-emph gradient-text">work.</span>
            </h1>
            <div
              style={{
                fontSize: 14,
                color: "var(--muted)",
                letterSpacing: "0.04em",
              }}
            >
              {site.work.length} projects · {site.city}
            </div>
          </div>
        </div>
      </section>

      <div
        data-nav-theme="light"
        style={{
          position: "sticky",
          top: "var(--nav-h)",
          zIndex: 20,
          background: "rgba(242,240,237,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--line-light)",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingBlock: 12,
          }}
        >
          <FilterRow label="Space">
            {spaceFilters.map((f) => (
              <Chip
                key={f.key}
                active={space === f.key}
                onClick={() => setSpace(f.key)}
              >
                {f.label}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Finish">
            {finishFilters.map((f) => (
              <Chip
                key={f.key}
                active={finish === f.key}
                onClick={() => setFinish(f.key)}
              >
                {f.label}
              </Chip>
            ))}
            <span style={{ flex: 1 }} />
            <SortToggle sort={sort} setSort={setSort} />
          </FilterRow>
        </div>
      </div>

      <section
        data-nav-theme="light"
        className="section section-light"
        style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}
      >
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div
              className="expanded-label"
              style={{ color: "var(--muted)", fontSize: 11 }}
            >
              {activeCount} {activeCount === 1 ? "project" : "projects"}
            </div>
            {anyFilter && (
              <button
                type="button"
                onClick={() => {
                  setSpace("all");
                  setFinish("all");
                }}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--magenta-2)",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {activeCount === 0 ? (
            <EmptyState
              finish={finish}
              space={spaceFilters.find((s) => s.key === space)?.label ?? ""}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 20,
              }}
              className="archive-grid"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => {
                  const spans = [7, 5, 5, 7, 6, 6];
                  const colSpan = spans[i % spans.length];
                  return (
                    <motion.figure
                      key={item.src}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      className="archive-tile"
                      style={{
                        gridColumn: `span ${colSpan}`,
                        margin: 0,
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 20,
                        aspectRatio: "4 / 3",
                        background: "var(--paper-2)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setLightbox(i)}
                        aria-label={`Open ${item.alt}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          padding: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 900px) 100vw, 50vw"
                          style={{
                            objectFit: "cover",
                            filter: "contrast(1.05) saturate(1.03)",
                            transition: "transform 0.6s ease",
                          }}
                        />
                        <span
                          className="expanded-label"
                          style={{
                            position: "absolute",
                            left: 16,
                            bottom: 16,
                            color: "#fff",
                            background: "rgba(11,11,13,0.55)",
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 10,
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                          }}
                        >
                          {item.space}
                        </span>
                      </button>
                    </motion.figure>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <style>{`
          .archive-tile:hover img { transform: scale(1.03); }
          @media (max-width: 760px) {
            .archive-grid > figure { grid-column: 1 / -1 !important; }
          }
        `}</style>
      </section>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          items={items}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((v) =>
              v === null ? v : (v - 1 + items.length) % items.length,
            )
          }
          onNext={() =>
            setLightbox((v) => (v === null ? v : (v + 1) % items.length))
          }
        />
      )}
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        className="expanded-label"
        style={{
          color: "var(--muted)",
          fontSize: 10,
          flexShrink: 0,
          width: 56,
        }}
      >
        {label}
      </span>
      <div
        className="scrollbar-hidden"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 2,
          scrollbarWidth: "none",
          flex: 1,
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 36,
        padding: "0 14px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#fff" : "var(--ink)",
        background: active
          ? "linear-gradient(100deg, var(--magenta), var(--violet))"
          : "transparent",
        border: active ? "1px solid transparent" : "1px solid var(--line-light)",
        scrollSnapAlign: "start",
        flexShrink: 0,
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

function SortToggle({
  sort,
  setSort,
}: {
  sort: Sort;
  setSort: (s: Sort) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "var(--paper-2)",
        flexShrink: 0,
      }}
    >
      {(["newest", "popular"] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setSort(key)}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            color: sort === key ? "#fff" : "var(--muted)",
            background: sort === key ? "var(--ink)" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          {key === "newest" ? "Newest" : "Most popular"}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ finish, space }: { finish: string; space: string }) {
  return (
    <div
      style={{
        padding: "72px 24px",
        textAlign: "center",
        border: "1px dashed var(--line-light)",
        borderRadius: 20,
      }}
    >
      <span className="eyebrow" style={{ justifyContent: "center" }}>
        Nothing here yet
      </span>
      <h3 style={{ marginTop: 16, fontSize: 24 }}>
        We haven&apos;t posted a {finish === "all" ? "project" : finish} in{" "}
        {space || "that space"} — yet.
      </h3>
      <Link
        href="/#quote"
        className="btn btn-primary"
        style={{ marginTop: 24 }}
      >
        Request a free quote
      </Link>
    </div>
  );
}

function Lightbox({
  index,
  items,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  items: typeof site.work;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") onPrev();
        if (e.key === "ArrowRight") onNext();
      }}
      tabIndex={-1}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(11,11,13,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: 10,
          color: "#fff",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <X size={20} />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 1200,
          width: "100%",
          aspectRatio: "4 / 3",
        }}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="100vw"
          style={{ objectFit: "contain", borderRadius: 12 }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -72,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{item.space}</div>
            <div
              className="expanded-label"
              style={{ color: "var(--muted-dark)", marginTop: 4, fontSize: 10 }}
            >
              {item.finish}
            </div>
          </div>
          <Link
            href={`/#quote?finish=${encodeURIComponent(item.finish)}`}
            className="btn btn-primary on-dark"
          >
            Request this floor
          </Link>
        </div>
      </div>
    </div>
  );
}
