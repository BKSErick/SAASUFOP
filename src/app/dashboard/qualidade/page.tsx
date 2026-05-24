/* =========================================================
   Qualidade CAPES (server) — PPGEP
   Métricas de produção (QUALIS, h-index, internacionalização)
   dependem da integração Lattes — pendente. Empty state honesto
   até a fonte de dados existir. Sem números fabricados.
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
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Quadriênio 2025–2028 · Engenharia de Produção</p>
        </div>
        <Btn variant="secondary" size="sm" icon={Ico.refresh({ size: 13 })}>Sincronizar Lattes</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "56px 24px", textAlign: "center" }}>
          <span style={{ color: "var(--muted-2)" }}>{Ico.chart({ size: 32 })}</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Indicadores CAPES pendentes</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", maxWidth: 460, lineHeight: 1.6 }}>
            As métricas de qualidade (extratos QUALIS, h-index, FWCI, internacionalização e produção qualificada)
            dependem da <strong>integração com o Currículo Lattes</strong>, ainda não implementada.
            Atualmente há <strong className="mono">{producoes.length}</strong> produções registradas.
          </p>
          <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
            <Btn variant="primary" size="sm" icon={Ico.upload({ size: 13 })}>Importar XML Lattes</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
