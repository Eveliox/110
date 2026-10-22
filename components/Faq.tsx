"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/site";

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderTop: "1px solid var(--line-light)",
      }}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li
            key={item.q}
            style={{ borderBottom: "1px solid var(--line-light)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "20px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: '"wdth" 115',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.q}
              </span>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid var(--line-light)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isOpen
                    ? "linear-gradient(100deg, var(--magenta), var(--violet))"
                    : "transparent",
                  color: isOpen ? "#fff" : "var(--ink)",
                  transition:
                    "transform 240ms ease, background 240ms ease, color 240ms ease",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                <ChevronDown size={16} strokeWidth={2} />
              </span>
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              hidden={!isOpen}
              style={{
                paddingBottom: isOpen ? 20 : 0,
                maxWidth: "68ch",
                color: "var(--muted)",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              {item.a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
