"use client";

/* =========================================================
   AppShell — orquestra Sidebar + Topbar + TweaksPanel
   Substitui App/AppShell de _prototype/app.jsx
   ========================================================= */
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette, type CommandItem } from "@/components/layout/CommandPalette";
import {
  useTweaks,
  PALETTE_HEX,
  type PaletteKey,
  type Density,
} from "@/hooks/useTweaks";
import { supabase } from "@/lib/supabase";

const ROUTE_TITLES: Record<string, string[]> = {
  "/dashboard": ["Painel"],
  "/dashboard/alunos": ["Pessoas", "Alunos"],
  "/dashboard/docentes": ["Pessoas", "Docentes"],
  "/dashboard/disciplinas": ["Acadêmico", "Disciplinas"],
  "/dashboard/bancas": ["Acadêmico", "Bancas"],
  "/dashboard/producoes": ["Pesquisa", "Produções"],
  "/dashboard/qualidade": ["Pesquisa", "Qualidade CAPES"],
  "/dashboard/relatorios": ["Operação", "Relatórios CAPES"],
  "/dashboard/integracoes": ["Operação", "Integrações"],
};

const PALETTE_LABEL: Record<PaletteKey, string> = {
  burgundy: "Burgundy",
  forest: "Forest",
  indigo: "Indigo",
  slate: "Slate",
};

const DENSITIES: { value: Density; label: string }[] = [
  { value: "compact", label: "Compacto" },
  { value: "comfortable", label: "Padrão" },
  { value: "spacious", label: "Amplo" },
];

export interface AppShellProps {
  children: ReactNode;
  commandItems: CommandItem[];
  userName?: string;
  userEmail?: string;
}

export function AppShell({ children, commandItems, userName, userEmail }: AppShellProps) {
  const [tw, setTweak] = useTweaks();
  const [collapsed, setCollapsed] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmd((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const breadcrumb =
    ROUTE_TITLES[pathname] ??
    (Object.entries(ROUTE_TITLES).find(([k]) => pathname.startsWith(k) && k !== "/dashboard")?.[1] ?? ["Painel"]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <Sidebar collapsed={collapsed} userName={userName} userEmail={userEmail} onSignOut={handleSignOut} />

      <main style={{ marginLeft: collapsed ? 64 : 232, minHeight: "100vh", transition: "margin var(--t-mid)" }}>
        <Topbar
          breadcrumb={breadcrumb}
          theme={tw.theme}
          onToggleTheme={() => setTweak("theme", tw.theme === "light" ? "dark" : "light")}
          onOpenSearch={() => setShowCmd(true)}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          actions={
            <button
              onClick={() => setShowTweaks((s) => !s)}
              title="Aparência"
              style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid transparent", color: "var(--fg-2)", display: "flex" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          }
        />

        <div style={{ padding: "24px 28px 64px" }} className="fade-in">
          {children}
        </div>
      </main>

      {showCmd && <CommandPalette items={commandItems} onClose={() => setShowCmd(false)} />}

      {showTweaks && (
        <div onClick={() => setShowTweaks(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              right: 20,
              top: 64,
              width: 260,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow-lg)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              zIndex: 91,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Aparência</div>

            {/* Tema */}
            <Field label="Tema">
              <Segmented
                value={tw.theme}
                options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
                onChange={(v) => setTweak("theme", v as "light" | "dark")}
              />
            </Field>

            {/* Paleta */}
            <Field label="Paleta">
              <div style={{ display: "flex", gap: 8 }}>
                {(Object.keys(PALETTE_HEX) as PaletteKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTweak("palette", k)}
                    title={PALETTE_LABEL[k]}
                    style={{
                      flex: 1,
                      height: 28,
                      borderRadius: 7,
                      background: PALETTE_HEX[k],
                      border: tw.palette === k ? "2px solid var(--fg)" : "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </Field>

            {/* Densidade */}
            <Field label="Densidade">
              <Segmented value={tw.density} options={DENSITIES} onChange={(v) => setTweak("density", v as Density)} />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      {children}
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", padding: 2, borderRadius: 8, background: "var(--inset)", gap: 2 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1,
            padding: "5px 6px",
            fontSize: 12,
            borderRadius: 6,
            border: "none",
            background: value === o.value ? "var(--surface)" : "transparent",
            color: value === o.value ? "var(--fg)" : "var(--muted)",
            fontWeight: value === o.value ? 500 : 400,
            boxShadow: value === o.value ? "var(--shadow-sm)" : "none",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
