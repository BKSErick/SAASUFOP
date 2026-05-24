/* =========================================================
   DocentesView — grid de orientadores (PPGEP)
   Dados reais: nome + orientandos_count. Campos Lattes
   (titulo, CAPES, h-index, produções, linha) pendentes →
   empty states honestos ("—"), sem inventar.
   ========================================================= */
import type { ReactNode } from "react";
import { Card, Pill, Avatar } from "@/components/ui/primitives";

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--divider)" }}>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
        <span className="mono tabular" style={{ fontSize: 18, fontWeight: 500 }}>{value}</span>
        {sub && <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{sub}</span>}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="mono tabular" style={{ fontSize: 16, fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

export function DocentesView({ docentes }: { docentes: import("@/types/domain").Docente[] }) {
  const sorted = [...docentes].sort((a, b) => b.orientandos - a.orientandos);
  const totalOrientandos = docentes.reduce((s, d) => s + d.orientandos, 0);

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Docentes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{docentes.length} orientadores · Engenharia de Produção</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--d-gap)", marginBottom: 16 }}>
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Carga de orientação</h3>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            <strong className="mono" style={{ color: "var(--fg)" }}>{totalOrientandos}</strong> orientandos ativos distribuídos entre{" "}
            <strong className="mono" style={{ color: "var(--fg)" }}>{docentes.length}</strong> docentes
            (média {docentes.length ? (totalOrientandos / docentes.length).toFixed(1) : "0"} por docente).
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--muted-2)" }}>
            Índices Lattes (h-index, Qualis CAPES, linhas de pesquisa, produções) serão preenchidos pela integração Lattes — pendente.
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Snapshot</h3>
          <Stat label="Orientandos ativos" value={totalOrientandos} sub="vínculos atuais" />
          <Stat label="Docentes cadastrados" value={docentes.length} sub="orientadores" />
          <Stat label="Integração Lattes" value="—" sub="pendente" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--d-gap)" }}>
        {sorted.map((d) => (
          <Card key={d.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar name={d.nome} hue={(d.nome.charCodeAt(0) * 41) % 360} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{d.nome}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.titulo || "Docente · Eng. Produção"}</div>
              </div>
              {d.capes && <Pill tone={d.capes === "1A" ? "accent" : d.capes === "1B" ? "info" : "neutral"}>{d.capes}</Pill>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, borderTop: "1px solid var(--divider)", paddingTop: 10 }}>
              <MiniStat label="Orient." value={d.orientandos} />
              <MiniStat label="h-index" value={d.h > 0 ? d.h : "—"} />
              <MiniStat label="Prod." value={d.producao > 0 ? d.producao : "—"} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
