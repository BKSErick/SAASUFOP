"use client";

/* =========================================================
   CommandPalette — busca global (⌘K)
   Port de _prototype/shell.jsx; navega via Next router
   ========================================================= */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/icons";

export interface CommandItem {
  type: string;
  label: string;
  hint: string;
  href: string;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  onClose: () => void;
}

export function CommandPalette({ items, onClose }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!q) return items.slice(0, 10);
    const lower = q.toLowerCase();
    return items.filter((i) => (i.label + " " + i.hint).toLowerCase().includes(lower)).slice(0, 12);
  }, [q, items]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in oklch, var(--bg) 50%, transparent)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "92vw",
          background: "var(--surface)",
          borderRadius: 14,
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--divider)" }}>
          {Ico.search({ size: 16 })}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aluno, docente, página…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--fg)", fontSize: 14, fontFamily: "inherit" }}
          />
          <span className="kbd">esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 6 }}>
          {results.map((item, i) => (
            <button
              key={i}
              onClick={() => go(item.href)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                textAlign: "left",
                color: "var(--fg)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "var(--inset)",
                  color: "var(--muted)",
                  minWidth: 60,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {item.type}
              </span>
              <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.hint}</span>
            </button>
          ))}
          {results.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Nada encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
