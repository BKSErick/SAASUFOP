"use client";

/* =========================================================
   DocentesView - grid de orientadores com upload de planilha por docente
   ========================================================= */
import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, Avatar, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import type { Docente } from "@/types/domain";

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

interface ImportState {
  id: string;
  status: "loading" | "ok" | "error";
  message: string;
}

function QualitySpreadsheetButton({ docenteId, onResult }: { docenteId: string; onResult: (state: ImportState) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function upload(file: File) {
    setLoading(true);
    onResult({ id: docenteId, status: "loading", message: "Importando planilha de curriculo..." });

    const body = new FormData();
    body.append("professorId", docenteId);
    body.append("file", file);

    try {
      const res = await fetch("/api/quality/import", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Falha na importacao");

      const summary = data.summary ?? {};
      onResult({
        id: docenteId,
        status: "ok",
        message: `${data.imported ?? 0} producoes importadas; ${summary.missingQualis ?? 0} sem Qualis`,
      });
      router.refresh();
    } catch (error) {
      onResult({
        id: docenteId,
        status: "error",
        message: error instanceof Error ? error.message : "Falha ao importar planilha de curriculo",
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Btn
        variant="secondary"
        size="sm"
        icon={Ico.upload({ size: 12 })}
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title="Subir planilha de curriculo do docente"
      >
        {loading ? "Importando" : "Subir planilha"}
      </Btn>
    </>
  );
}

export function DocentesView({ docentes }: { docentes: Docente[] }) {
  const sorted = [...docentes].sort((a, b) => b.orientandos - a.orientandos);
  const totalOrientandos = docentes.reduce((s, d) => s + d.orientandos, 0);
  const [importState, setImportState] = useState<ImportState | null>(null);

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Docentes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{docentes.length} orientadores - Engenharia de Producao</p>
        </div>
      </div>

      {importState && (
        <Card style={{ marginBottom: 16, borderColor: importState.status === "error" ? "var(--danger)" : importState.status === "ok" ? "var(--ok)" : "var(--border)" }}>
          <div style={{ fontSize: 12, color: importState.status === "error" ? "var(--danger)" : "var(--fg-2)" }}>
            {importState.message}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--d-gap)", marginBottom: 16 }}>
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Carga de orientacao</h3>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            <strong className="mono" style={{ color: "var(--fg)" }}>{totalOrientandos}</strong> orientandos ativos distribuidos entre{" "}
            <strong className="mono" style={{ color: "var(--fg)" }}>{docentes.length}</strong> docentes
            (media {docentes.length ? (totalOrientandos / docentes.length).toFixed(1) : "0"} por docente).
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--muted-2)" }}>
            Cada professor deve anexar sua planilha de curriculo. O importador extrai publicacoes, ISSN, DOI, QUALIS, JCR/Scopus quando existirem na planilha; o que faltar fica marcado para crosswalk externo.
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Snapshot</h3>
          <Stat label="Orientandos ativos" value={totalOrientandos} sub="vinculos atuais" />
          <Stat label="Docentes cadastrados" value={docentes.length} sub="orientadores" />
          <Stat label="Planilhas recebidas" value={docentes.filter((d) => d.lattes).length} sub="docentes atualizados" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--d-gap)" }}>
        {sorted.map((d) => {
          const lastImport = d.lattes ? new Date(d.lattes).toLocaleDateString("pt-BR") : "Sem planilha";
          return (
            <Card key={d.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar name={d.nome} hue={(d.nome.charCodeAt(0) * 41) % 360} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{d.nome}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.titulo || "Docente - Eng. Producao"}</div>
                </div>
                {d.capes && <Pill tone={d.capes === "1A" ? "accent" : d.capes === "1B" ? "info" : "neutral"}>{d.capes}</Pill>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, borderTop: "1px solid var(--divider)", paddingTop: 10 }}>
                <MiniStat label="Orient." value={d.orientandos} />
                <MiniStat label="h-index" value={d.h > 0 ? d.h : "-"} />
                <MiniStat label="Prod." value={d.producao > 0 ? d.producao : "-"} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid var(--divider)", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Planilha: {lastImport}</span>
                <QualitySpreadsheetButton docenteId={d.id} onResult={setImportState} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
