import { Card, Btn } from "@/components/ui/primitives";

const integrations = [
  { name: "SRA UFOP", status: "Ativo", sync: "fonte de alunos", icon: "U", color: "var(--ok)" },
  { name: "Planilhas de curriculo", status: "Ativo", sync: "upload por docente", icon: "X", color: "var(--ok)" },
  { name: "XML Lattes", status: "Ativo", sync: "upload por docente", icon: "L", color: "var(--ok)" },
  { name: "Sucupira CAPES", status: "Pendente", sync: "-", icon: "C", color: "var(--warn)" },
  { name: "Web of Science", status: "Pendente", sync: "-", icon: "W", color: "var(--warn)" },
  { name: "Scopus / Elsevier", status: "Pendente", sync: "-", icon: "S", color: "var(--muted)" },
];

export default function IntegracoesPage() {
  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Integracoes</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Fontes de dados e conectores do SaaS UFOP</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--d-gap)" }}>
        {integrations.map((i) => (
          <Card key={i.name} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--inset)", color: "var(--fg-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 16 }}>{i.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{i.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Ultima sincronizacao: {i.sync}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--divider)", paddingTop: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: i.color }} />
                {i.status}
              </span>
              <Btn variant={i.status === "Ativo" ? "ghost" : "secondary"} size="sm" disabled title="Acao de integracao pendente">
                {i.status === "Ativo" ? "Gerenciar" : "Conectar"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
