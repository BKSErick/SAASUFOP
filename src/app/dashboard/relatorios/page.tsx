import { Card, Pill, Btn, type PillTone } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";

const reports = [
  { id: "r1", title: "Relatorio Sucupira 2025", periodo: "Coleta CAPES 2025", status: "Concluido", date: "12 Mar 2026" },
  { id: "r2", title: "Avaliacao Quadrienal 2021-2024", periodo: "APCN em revisao", status: "Em revisao", date: "28 Abr 2026" },
  { id: "r3", title: "Plano de Desenvolvimento 2026", periodo: "PDI institucional", status: "Rascunho", date: "08 Mai 2026" },
  { id: "r4", title: "Relatorio de Bolsas 2026/1", periodo: "CAPES, CNPq, FAPEMIG", status: "Pendente", date: "-" },
];

const COLS = "1fr 1fr 120px 100px 40px";

function statusTone(status: string): PillTone {
  if (status === "Concluido") return "ok";
  if (status === "Em revisao") return "info";
  if (status === "Rascunho") return "warn";
  return "neutral";
}

export default function RelatoriosPage() {
  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Relatorios CAPES</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Exportacao Sucupira, APCN e documentos institucionais</p>
        </div>
        <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} disabled title="Geracao de relatorios pendente">Gerar relatorio</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--d-gap)", marginBottom: "var(--d-gap)" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Proxima coleta</span>
          <span style={{ fontSize: 24, fontWeight: 500, fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>15 dias</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Sucupira 2026 - prazo 29 mai</span>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Completude do relatorio</span>
          <span className="mono tabular" style={{ fontSize: 24, fontWeight: 500 }}>72%</span>
          <div style={{ height: 4, background: "var(--inset)", borderRadius: 100 }}>
            <div style={{ width: "72%", height: "100%", background: "var(--accent)", borderRadius: 100 }} />
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Pendencias</span>
          <span className="mono tabular" style={{ fontSize: 24, fontWeight: 500, color: "var(--warn)" }}>14</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>9 curriculos - 5 documentos de aluno</span>
        </Card>
      </div>

      <Card padding={0}>
        {reports.map((r, i) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: COLS, gap: 14, padding: "16px 20px", borderBottom: i < reports.length - 1 ? "1px solid var(--divider)" : "none", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{r.periodo}</div>
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.date}</span>
            <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            <Btn variant="secondary" size="sm" icon={Ico.download({ size: 12 })} disabled title="Download pendente">Baixar</Btn>
            <Btn variant="ghost" size="sm" style={{ padding: 6 }} disabled title="Mais acoes pendentes">{Ico.dotsV({ size: 14 })}</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}
