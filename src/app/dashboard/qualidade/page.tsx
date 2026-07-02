/* =========================================================
   Qualidade CAPES (server) - PPGEP
   Indicadores reais consolidados de producoes/docentes.
   ========================================================= */
import type { ReactNode } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Donut, HBars } from "@/components/charts";
import { getQualityCapesMetrics } from "@/lib/data";
import { ScopusVerifyButton } from "./ScopusVerifyButton";

const PALETTE = ["var(--accent)", "var(--info)", "var(--warn)", "var(--ok)", "var(--danger)", "var(--muted)"];
const QUALIS_ORDER = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C"];
const JCR_ORDER = ["Q1", "Q2", "Q3", "Q4"];

function Metric({ label, value, hint, tone }: { label: string; value: ReactNode; hint: string; tone?: "danger" | "info" | "ok" }) {
  const color = tone === "danger" ? "var(--danger)" : tone === "info" ? "var(--info)" : tone === "ok" ? "var(--ok)" : "var(--fg)";
  return (
    <Card style={{ minHeight: 118, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.02em", fontWeight: 500 }}>{label}</div>
      <div className="mono tabular" style={{ fontSize: 34, lineHeight: 1, color }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{hint}</div>
    </Card>
  );
}

function countData(counts: Record<string, number>, order: string[]) {
  return order
    .map((label, index) => ({ label, value: counts[label] ?? 0, color: PALETTE[index % PALETTE.length] }))
    .filter((item) => item.value > 0);
}

export default async function QualidadePage() {
  const metrics = await getQualityCapesMetrics();
  const qualisData = countData(metrics.qualisCounts, QUALIS_ORDER);
  const jcrData = countData(metrics.jcrCounts, JCR_ORDER);
  const hCoverage = metrics.totalDocentes > 0 ? Math.round((metrics.docentesComHIndex / metrics.totalDocentes) * 100) : 0;
  const fwciCoverage = metrics.totalDocentes > 0 ? Math.round((metrics.docentesComFwci / metrics.totalDocentes) * 100) : 0;

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Qualidade CAPES</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Quadrienio 2025-2028 - dados vindos das planilhas docentes, XML Lattes e crosswalk QUALIS/JCR.
          </p>
        </div>
        <ScopusVerifyButton />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--d-gap)", marginBottom: 16 }}>
        <Metric label="Producoes importadas" value={metrics.totalProducoes} hint="registros reais em producoes" />
        <Metric label="QUALIS A1/A2" value={metrics.producaoA1A2} hint="extratos de maior peso" tone="info" />
        <Metric label="Producao qualificada" value={metrics.producaoQualificada} hint="A1-A4 + B1" tone="ok" />
        <Metric label="Sem QUALIS" value={metrics.semQualis} hint="dependem de planilha ou crosswalk" tone={metrics.semQualis > 0 ? "danger" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--d-gap)", marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Extratos QUALIS</h3>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>Distribuicao por publicacao importada</p>
            </div>
            <Pill tone={metrics.semQualis > 0 ? "warn" : "ok"}>{metrics.semQualis} pendentes</Pill>
          </div>
          {qualisData.length > 0 ? (
            <Donut data={qualisData} size={150} thickness={16} label="QUALIS" />
          ) : (
            <div style={{ padding: "44px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Nenhum extrato QUALIS registrado ainda.
            </div>
          )}
        </Card>

        <Card>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>JCR / Scopus</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
              Quartis JCR e links DOI/Scopus quando presentes na planilha.
            </p>
          </div>
          {jcrData.length > 0 ? (
            <HBars data={jcrData.map((item) => ({ label: item.label, value: item.value }))} color="var(--info)" />
          ) : (
            <div style={{ padding: "26px 0", color: "var(--muted)", fontSize: 13 }}>
              Nenhum quartil JCR registrado. Importe a base JCR ou planilhas docentes com quartil preenchido.
            </div>
          )}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>Producoes com DOI/Scopus</span>
            <strong className="mono tabular" style={{ fontWeight: 500 }}>{metrics.scopusLinks}</strong>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--d-gap)" }}>
        <Card>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>h-index</h3>
          <div className="mono tabular" style={{ marginTop: 16, fontSize: 34, lineHeight: 1 }}>{metrics.mediaHIndex.toFixed(1)}</div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>
            media entre {metrics.docentesComHIndex} de {metrics.totalDocentes} docentes com h-index preenchido.
          </p>
          <div style={{ marginTop: 12, height: 6, background: "var(--inset)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: `${hCoverage}%`, height: "100%", background: "var(--accent)" }} />
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>FWCI</h3>
          <div className="mono tabular" style={{ marginTop: 16, fontSize: 34, lineHeight: 1 }}>{metrics.mediaFwci.toFixed(2)}</div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>
            media entre {metrics.docentesComFwci} de {metrics.totalDocentes} docentes com FWCI preenchido.
          </p>
          <div style={{ marginTop: 12, height: 6, background: "var(--inset)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: `${fwciCoverage}%`, height: "100%", background: "var(--info)" }} />
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Internacionalizacao</h3>
          <div className="mono tabular" style={{ marginTop: 16, fontSize: 34, lineHeight: 1 }}>0</div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>
            ainda sem fonte estruturada. Precisa vir da planilha docente ou XML Lattes enriquecido com pais/coautoria externa.
          </p>
          <Pill tone="warn" style={{ marginTop: 12 }}>Fonte pendente</Pill>
        </Card>
      </div>
    </div>
  );
}
