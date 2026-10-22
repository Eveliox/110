import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className="section-dark on-dark"
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBlock: "clamp(72px, 10vw, 120px) 32px",
      }}
    >
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 56,
            borderBottom: "1px solid var(--line-dark)",
          }}
          className="footer-grid"
        >
          <div>
            <Logo width={160} variant="light" />
            <p
              style={{
                marginTop: 24,
                color: "var(--muted-dark)",
                maxWidth: "34ch",
              }}
            >
              {site.tagline} Residential and commercial epoxy, flake, metallic,
              and polished concrete floor coatings.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <SocialLink href={site.socials.instagram} label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href={site.socials.facebook} label="Facebook">
                <FacebookIcon />
              </SocialLink>
            </div>
          </div>

          <div>
            <div className="expanded-label" style={{ color: "var(--muted-dark)" }}>
              Finishes
            </div>
            <ul
              style={{
                marginTop: 16,
                listStyle: "none",
                padding: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {site.finishes.map((f) => (
                <li key={f.slug}>
                  <a
                    href="#finishes"
                    style={{
                      color: "var(--muted-dark)",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                  >
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="expanded-label" style={{ color: "var(--muted-dark)" }}>
              Company
            </div>
            <ul
              style={{
                marginTop: 16,
                listStyle: "none",
                padding: 0,
                display: "grid",
                gap: 10,
              }}
            >
              <li>
                <a href="#work" style={{ color: "var(--muted-dark)", fontSize: 14 }}>
                  Selected Work
                </a>
              </li>
              <li>
                <a href="#process" style={{ color: "var(--muted-dark)", fontSize: 14 }}>
                  Process
                </a>
              </li>
              <li>
                <a href="#about" style={{ color: "var(--muted-dark)", fontSize: 14 }}>
                  About
                </a>
              </li>
              <li>
                <a href="#quote" style={{ color: "var(--muted-dark)", fontSize: 14 }}>
                  Get a Quote
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="expanded-label" style={{ color: "var(--muted-dark)" }}>
              Contact
            </div>
            <ul
              style={{
                marginTop: 16,
                listStyle: "none",
                padding: 0,
                display: "grid",
                gap: 10,
              }}
            >
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--muted-dark)",
                  fontSize: 14,
                }}
              >
                <Phone size={14} strokeWidth={1.5} />
                <a href={site.phoneHref}>{site.phoneDisplay}</a>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--muted-dark)",
                  fontSize: 14,
                }}
              >
                <Mail size={14} strokeWidth={1.5} />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--muted-dark)",
                  fontSize: 14,
                }}
              >
                <MapPin size={14} strokeWidth={1.5} />
                {site.city}
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12,
            color: "var(--muted-dark)",
          }}
        >
          <span>
            © {site.copyrightYear} {site.name}. Licensed &amp; insured.
          </span>
          <span className="expanded-label">
            {site.serviceAreaDescription}
          </span>
        </div>
      </div>

      <div className="footer-mark" aria-hidden>
        110%
      </div>

      <style>{`
        .footer-grid a:hover { color: #fff !important; }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1px solid var(--line-dark)",
        color: "var(--muted-dark)",
        transition: "color 0.2s, border-color 0.2s",
      }}
    >
      {children}
    </a>
  );
}
