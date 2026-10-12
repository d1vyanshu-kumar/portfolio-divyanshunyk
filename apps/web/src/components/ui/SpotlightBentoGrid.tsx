import React, { useState } from "react";

interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  org: string;
  period: string;
  featured: boolean;
  tags: string[];
  metrics: { label: string; value: string }[];
}

interface Props {
  caseStudies: CaseStudy[];
}

function BentoCard({ study, isPrimary }: { study: CaseStudy; isPrimary?: boolean }) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={`bento-card-wrapper ${isPrimary ? "bento-col-span-2" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      style={{
        position: "relative",
        borderRadius: "1.5rem",
        padding: "1px",
        background: isHovered
          ? `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 84, 54, 0.4), rgba(99, 102, 241, 0.2), var(--color-glass-border))`
          : "var(--color-glass-border)",
        transition: "box-shadow 0.3s ease",
        boxShadow: isHovered
          ? "0 20px 40px -15px rgba(255, 84, 54, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "calc(1.5rem - 1px)",
          padding: isPrimary ? "2rem" : "1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1.25rem",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Top Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent)",
                fontWeight: 700,
                letterSpacing: "var(--tracking-caps)",
                textTransform: "uppercase",
              }}
            >
              {study.org}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                color: "var(--color-muted)",
              }}
            >
              {study.period}
            </span>
          </div>

          <h3
            style={{
              fontSize: isPrimary ? "1.65rem" : "1.35rem",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.25,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              minWidth: 0,
            }}
          >
            <a
              href={`/work/${study.slug}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              className="bento-title-link"
            >
              {study.title}
            </a>
          </h3>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-muted)",
              lineHeight: 1.6,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              minWidth: 0,
            }}
          >
            {study.subtitle}
          </p>
        </div>

        {/* Metrics Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(study.metrics.length, isPrimary ? 4 : 2)}, 1fr)`,
            gap: "0.75rem",
            padding: "0.85rem 0",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            minWidth: 0,
          }}
          className="bento-metrics-row"
        >
          {study.metrics.slice(0, isPrimary ? 4 : 2).map((m, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
              <span
                style={{
                  fontSize: isPrimary ? "1.25rem" : "1.1rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-accent)",
                  wordBreak: "break-word",
                }}
              >
                {m.value}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-caps)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer & Action CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", minWidth: 0 }}>
            {study.tags.slice(0, 3).map((tag, tIdx) => (
              <span
                key={tIdx}
                style={{
                  fontSize: "0.6875rem",
                  fontFamily: "var(--font-mono)",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={`/work/${study.slug}`}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-accent)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              whiteSpace: "nowrap",
            }}
            className="bento-read-more"
          >
            Deep dive &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SpotlightBentoGrid({ caseStudies }: Props) {
  return (
    <div className="bento-grid-container">
      {caseStudies.map((study, idx) => (
        <BentoCard key={study.slug} study={study} isPrimary={idx === 0} />
      ))}
    </div>
  );
}
