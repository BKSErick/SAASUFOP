/* =========================================================
   Integrações (server) — port de page-others.jsx::Integracoes
   ========================================================= */
import { Card, Btn } from "@/components/ui/primitives";

const integrations = [
  { name: "Plataforma Lattes / CNPq", status: "Conectado", sync: "há 2 horas", icon: "🇧🇷", color: "var(--ok)" },
  { name: "Sistema SRA · UFOP", status: "Conectado", sync: "ontem", icon: "U", color: "var(--ok)" },
  { name: "Sucupira CAPES", status: "Conectado", sync: "há 1 dia", icon: "C", color: "var(--ok)" },
  { name: "Google Workspace · UFOP", status: "Conectado", sync: "tempo real", icon: "G", color: "var(--ok)" },
  { name: "Web of Science", status: "Pendente OAuth", sync: "—", icon: "W", color: "var(--warn)" },
  { name: "Scopus / Elsevier", status: "Desconectado", sync: "—", icon: "S", color: "var(--muted)" },
];

export default function IntegracoesPage() {
  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Integrações</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Orion Engine · sincronizações com sistemas externos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--d-gap)" }}>
        {integrations.map((i) => (
          <Card key={i.name} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--inset)", color: "var(--fg-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 16 }}>{i.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{i.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Última sincronização · {i.sync}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--divider)", paddingTop: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: i.color }} />
                {i.status}
              </span>
              <Btn variant={i.status === "Conectado" ? "ghost" : "secondary"} size="sm">
                {i.status === "Conectado" ? "Gerenciar" : "Conectar"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
