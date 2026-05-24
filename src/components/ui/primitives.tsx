/* =========================================================
   UI primitives — Card, Pill, Avatar, Btn, Section
   Port tipado de _prototype/shell.jsx (inline-style + CSS vars)
   ========================================================= */
import type { CSSProperties, ReactNode } from "react";

// ----- Card -----
export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number | string;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, style, padding, className, onClick }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: padding ?? "var(--d-card-pad)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Pill -----
export type PillTone = "neutral" | "accent" | "ok" | "warn" | "danger" | "info";

export interface PillProps {
  children: ReactNode;
  tone?: PillTone;
  style?: CSSProperties;
}

const PILL_TONES: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--inset)", fg: "var(--fg-2)" },
  accent: { bg: "var(--accent-soft)", fg: "var(--accent-soft-fg)" },
  ok: { bg: "var(--ok-soft)", fg: "var(--ok)" },
  warn: { bg: "var(--warn-soft)", fg: "var(--warn)" },
  danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  info: { bg: "var(--info-soft)", fg: "var(--info)" },
};

export function Pill({ children, tone = "neutral", style }: PillProps) {
  const t = PILL_TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: t.bg,
        color: t.fg,
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.01em",
        padding: "2px 7px",
        borderRadius: 4,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ----- Avatar -----
export interface AvatarProps {
  name: string;
  hue?: number;
  size?: number;
}

export function Avatar({ name, hue, size = 28 }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const h = hue != null ? hue : (name.charCodeAt(0) * 13) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, oklch(0.72 0.1 ${h}), oklch(0.5 0.12 ${(h + 25) % 360}))`,
        display: "grid",
        placeItems: "center",
        color: "white",
        fontSize: size * 0.36,
        fontWeight: 600,
        flexShrink: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)",
      }}
    >
      {initials}
    </div>
  );
}

// ----- Btn -----
export type BtnVariant = "primary" | "secondary" | "ghost" | "soft";
export type BtnSize = "sm" | "md" | "lg";

export interface BtnProps {
  children?: ReactNode;
  variant?: BtnVariant;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  size?: BtnSize;
  title?: string;
}

const BTN_VARIANTS: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: "var(--accent)", fg: "var(--accent-fg)", border: "var(--accent)" },
  secondary: { bg: "var(--surface)", fg: "var(--fg)", border: "var(--border)" },
  ghost: { bg: "transparent", fg: "var(--fg-2)", border: "transparent" },
  soft: { bg: "var(--inset)", fg: "var(--fg)", border: "transparent" },
};

const BTN_SIZES: Record<BtnSize, CSSProperties> = {
  sm: { padding: "5px 9px", fontSize: 12 },
  md: { padding: "7px 12px", fontSize: 13 },
  lg: { padding: "9px 16px", fontSize: 14 },
};

export function Btn({
  children,
  variant = "ghost",
  icon,
  onClick,
  disabled,
  style,
  size = "md",
  title,
}: BtnProps) {
  const v = BTN_VARIANTS[variant];
  const sz = BTN_SIZES[size];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.border}`,
        borderRadius: 8,
        fontWeight: 500,
        fontFamily: "inherit",
        transition: "background var(--t-fast), opacity var(--t-fast)",
        opacity: disabled ? 0.5 : 1,
        ...sz,
        ...style,
      }}
    >
      {icon && <span style={{ display: "flex" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ----- Section -----
export interface SectionProps {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}

export function Section({ title, hint, action, children, style }: SectionProps) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12, ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            {title && <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>}
            {hint && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
