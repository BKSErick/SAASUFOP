"use client";

/* =========================================================
   Sidebar — port de _prototype/shell.jsx
   Hash routing → Next App Router (Link + usePathname)
   ========================================================= */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ico, type IconName } from "@/components/icons";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
}
interface NavGroup {
  section: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  { section: "Visão Geral", items: [{ href: "/dashboard", label: "Painel", icon: "home" }] },
  {
    section: "Pessoas",
    items: [
      { href: "/dashboard/alunos", label: "Alunos", icon: "aluno", count: 50 },
      { href: "/dashboard/docentes", label: "Docentes", icon: "docente", count: 12 },
    ],
  },
  {
    section: "Acadêmico",
    items: [
      { href: "/dashboard/disciplinas", label: "Disciplinas", icon: "book" },
      { href: "/dashboard/bancas", label: "Bancas", icon: "calendar", count: 6 },
    ],
  },
  {
    section: "Pesquisa",
    items: [
      { href: "/dashboard/producoes", label: "Produções", icon: "file" },
      { href: "/dashboard/qualidade", label: "Qualidade CAPES", icon: "chart" },
    ],
  },
  {
    section: "Operação",
    items: [
      { href: "/dashboard/relatorios", label: "Relatórios CAPES", icon: "file" },
      { href: "/dashboard/integracoes", label: "Integrações", icon: "plug" },
    ],
  },
];

export interface SidebarProps {
  collapsed: boolean;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

export function Sidebar({ collapsed, userName = "Coordenação", userEmail = "coord.ppgcc@ufop.br", onSignOut }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  return (
    <aside
      style={{
        width: collapsed ? 64 : 232,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        inset: "0 auto 0 0",
        transition: "width var(--t-mid)",
        zIndex: 30,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? "18px 12px" : "20px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--divider)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--accent)",
            display: "grid",
            placeItems: "center",
            color: "var(--accent-fg)",
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.18)",
          }}
        >
          U
        </div>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>PPGEP</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Eng. Produção · UFOP</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className="nice-scroll"
        style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}
      >
        {NAV.map((group) => (
          <div key={group.section} style={{ marginTop: 8 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  color: "var(--muted-2)",
                  padding: "6px 12px 4px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: collapsed ? "8px" : "7px 10px",
                    borderRadius: 7,
                    background: active ? "var(--inset)" : "transparent",
                    color: active ? "var(--fg)" : "var(--fg-2)",
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    textAlign: "left",
                    justifyContent: collapsed ? "center" : "flex-start",
                    position: "relative",
                    transition: "background var(--t-fast)",
                  }}
                >
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        left: -8,
                        top: "50%",
                        width: 3,
                        height: 16,
                        transform: "translateY(-50%)",
                        background: "var(--accent)",
                        borderRadius: 2,
                      }}
                    />
                  )}
                  <span style={{ color: active ? "var(--accent)" : "var(--muted)", display: "flex" }}>
                    {Ico[item.icon]({ size: 16 })}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.count != null && (
                        <span
                          className="mono tabular"
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            background: active ? "var(--surface)" : "transparent",
                            padding: "1px 6px",
                            borderRadius: 4,
                            minWidth: 22,
                            textAlign: "center",
                          }}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--divider)", padding: collapsed ? 10 : 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, oklch(0.7 0.12 30), oklch(0.55 0.13 18))",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, lineHeight: 1.2, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
            </div>
            <button
              onClick={onSignOut}
              style={{ background: "transparent", border: "none", color: "var(--muted)", padding: 4, borderRadius: 4, display: "flex" }}
              title="Sair"
            >
              {Ico.out({ size: 14 })}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
