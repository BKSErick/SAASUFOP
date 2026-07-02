/* =========================================================
   Qualidade CAPES (server) - PPGEP
   Metricas de producao vêm das planilhas de curriculo anexadas
   por docente, com QUALIS/JCR/Scopus cruzados por base externa.
   ========================================================= */
import { Card, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import { getProducoes } from "@/lib/data";

export default async function QualidadePage() {
  const producoes = await getProducoes();

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Qualidade CAPES</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Quadrienio 2025-2028 - Engenharia de Producao</p>
        </div>
        <Btn variant="secondary" size="sm" icon={Ico.refresh({ size: 13 })} disabled title="Use o botao Subir planilha em Docentes">Atualizar crosswalk</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "56px 24px", textAlign: "center" }}>
          <span style={{ color: "var(--muted-2)" }}>{Ico.chart({ size: 32 })}</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Indicadores CAPES pendentes</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", maxWidth: 520, lineHeight: 1.6 }}>
            As metricas de qualidade (extratos QUALIS, h-index, FWCI, internacionalizacao e producao qualificada)
            serao consolidadas a partir das <strong>planilhas de curriculo anexadas pelos docentes</strong>.
            Atualmente ha <strong className="mono">{producoes.length}</strong> producoes registradas.
          </p>
          <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
            <Btn variant="primary" size="sm" icon={Ico.upload({ size: 13 })} disabled title="A importacao fica no card de cada docente">Importar planilha por docente</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
