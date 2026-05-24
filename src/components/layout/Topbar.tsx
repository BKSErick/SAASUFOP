"use client";

/* =========================================================
   Topbar — port de _prototype/shell.jsx
   ========================================================= */
import type { ReactNode } from "react";
import { Ico } from "@/components/icons";
import type { ThemeMode } from "@/hooks/useTweaks";

export interface TopbarProps {
  breadcrumb?: string[];
  title?: string;
  actions?: ReactNode;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export function Topbar({ breadcrumb, title, actions, theme, onToggleTheme, onOpenSearch, onToggleSidebar }: TopbarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in oklch, var(--bg) 86%, transparent)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--divider)",
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        minHeight: 56,
      }}
    >
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          title="Recolher menu"
          style={{ padding: 6, borderRadius: 8, background: "transparent", border: "1px solid transparent", color: "var(--fg-2)", display: "flex" }}
        >
          {Ico.list({ size: 16 })}
        </button>
      )}

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        {breadcrumb && breadcrumb.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            {breadcrumb.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && Ico.chevron({ size: 12 })}
                <span style={{ color: i === breadcrumb.length - 1 ? "var(--fg)" : "var(--muted)" }}>{b}</span>
              </span>
            ))}
          </div>
        ) : (
          title && <h1 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{title}</h1>
        )}
      </div>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 8,
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: 12,
          minWidth: 240,
        }}
      >
        {Ico.search({ size: 14 })}
        <span style={{ flex: 1, textAlign: "left" }}>Buscar aluno, docente, banca…</span>
        <span className="kbd">⌘K</span>
      </button>

      {/* Bell */}
      <button style={{ position: "relative", padding: 8, borderRadius: 8, background: "transparent", border: "1px solid transparent", color: "var(--fg-2)" }}>
        {Ico.bell({ size: 16 })}
        <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
      </button>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        title="Trocar tema"
        style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid transparent", color: "var(--fg-2)", display: "flex" }}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>

      <div style={{ width: 1, height: 22, background: "var(--divider)" }} />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
    </header>
  );
}
