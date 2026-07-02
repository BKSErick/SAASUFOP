import { Card, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import { getDisciplinas } from "@/lib/data";

const COLS = "100px 2fr 1fr 100px 80px 100px";

export default async function DisciplinasPage() {
  const disciplinas = await getDisciplinas();

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Disciplinas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{disciplinas.length} ofertadas - fonte real Supabase</p>
        </div>
        <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} disabled title="Importacao semestral de disciplinas pendente">Nova disciplina</Btn>
      </div>
      <Card padding={0}>
        {disciplinas.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 24px", textAlign: "center", color: "var(--muted)" }}>
            <span style={{ color: "var(--muted-2)" }}>{Ico.book({ size: 28 })}</span>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-2)" }}>Nenhuma disciplina no banco real</div>
            <div style={{ fontSize: 12, maxWidth: 460 }}>
              A tabela `disciplinas` existe, mas esta vazia no Supabase. A fonte prevista nas reunioes e o formulario/planilha semestral de disciplinas lecionadas por professor.
            </div>
          </div>
        )}
        {disciplinas.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 16px", borderBottom: "1px solid var(--divider)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
            <span>Codigo</span><span>Disciplina</span><span>Professor</span><span>Periodo</span><span>Cred.</span><span style={{ textAlign: "right" }}>Matricul.</span>
          </div>
        )}
        {disciplinas.map((d, i) => (
          <div key={d.id} style={{ display: "grid", gridTemplateColumns: COLS, padding: "12px 16px", borderBottom: i < disciplinas.length - 1 ? "1px solid var(--divider)" : "none", alignItems: "center", fontSize: 13 }}>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.codigo}</span>
            <span style={{ fontWeight: 500 }}>{d.nome}</span>
            <span style={{ color: "var(--fg-2)" }}>{d.professor}</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{d.periodo}</span>
            <span className="mono" style={{ color: "var(--fg-2)" }}>{d.creditos}</span>
            <span style={{ textAlign: "right" }}>
              <span className="mono tabular" style={{ fontWeight: 500 }}>{d.matriculados}</span>
              <span style={{ color: "var(--muted)" }}> alunos</span>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
