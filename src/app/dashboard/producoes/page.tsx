/* =========================================================
   Produções (server) — port de page-others.jsx::Producoes
   ========================================================= */
import { Card, Pill, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import { getProducoes } from "@/lib/data";

const COLS = "70px 1fr 200px 120px 60px";

export default async function ProducoesPage() {
  const producoes = await getProducoes();

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Produções</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{producoes.length} importadas · sincronizado com Lattes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={Ico.refresh({ size: 13 })}>Sincronizar Lattes</Btn>
          <Btn variant="primary" size="sm" icon={Ico.upload({ size: 13 })}>Importar XML</Btn>
        </div>
      </div>
      <Card padding={producoes.length === 0 ? undefined : 0}>
        {producoes.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 24px", textAlign: "center", color: "var(--muted)" }}>
            <span style={{ color: "var(--muted-2)" }}>{Ico.file({ size: 28 })}</span>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-2)" }}>Nenhuma produção registrada</div>
            <div style={{ fontSize: 12, maxWidth: 380 }}>As publicações serão importadas via Currículo Lattes (XML) ou integração Scopus/SJR — módulo pendente.</div>
          </div>
        )}
        {producoes.map((p, i) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: COLS, gap: 14, padding: "16px 20px", borderBottom: i < producoes.length - 1 ? "1px solid var(--divider)" : "none", alignItems: "center" }}>
            <Pill tone={p.qualis === "A1" ? "accent" : p.qualis === "A2" ? "info" : "neutral"}>{p.qualis}</Pill>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{p.titulo}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{p.autores.join(", ")}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{p.venue}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{p.ano}</span>
            <Btn variant="ghost" size="sm" style={{ justifySelf: "end" }}>{Ico.chevron({ size: 14 })}</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}
