"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import type { Disciplina, Docente } from "@/types/domain";

const COLS = "100px 2fr 1fr 100px 80px 100px";

type ImportState = {
  status: "idle" | "loading" | "ok" | "error";
  message: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5, color: "var(--muted)" }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  height: 34,
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--surface)",
  color: "var(--fg)",
  padding: "0 10px",
  font: "inherit",
  fontSize: 13,
};

export function DisciplinasView({ disciplinas, docentes }: { disciplinas: Disciplina[]; docentes: Docente[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [openForm, setOpenForm] = useState(false);
  const [state, setState] = useState<ImportState>({ status: "idle", message: "" });
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    professorNome: "",
    periodo: "2026/1",
    creditos: 4,
    matriculados: 0,
  });

  async function upload(file: File) {
    setState({ status: "loading", message: `Importando ${file.name}...` });
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/disciplinas/import", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || data?.error || "Falha ao importar disciplinas");
      setState({
        status: "ok",
        message: `${data.imported ?? 0} disciplinas processadas; ${data.inserted ?? 0} novas; ${data.updated ?? 0} atualizadas.`,
      });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Falha ao importar disciplinas" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submitManual(event: FormEvent) {
    event.preventDefault();
    setState({ status: "loading", message: "Salvando disciplina..." });

    try {
      const response = await fetch("/api/disciplinas/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || data?.error || "Falha ao salvar disciplina");
      setState({ status: "ok", message: "Disciplina salva no Supabase." });
      setOpenForm(false);
      setForm((current) => ({ ...current, codigo: "", nome: "", matriculados: 0 }));
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Falha ao salvar disciplina" });
    }
  }

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Disciplinas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{disciplinas.length} ofertadas - fonte real Supabase</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Btn variant="secondary" size="sm" icon={Ico.upload({ size: 13 })} disabled={state.status === "loading"} onClick={() => inputRef.current?.click()}>
            Importar planilha
          </Btn>
          <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} onClick={() => setOpenForm((value) => !value)}>
            Nova disciplina
          </Btn>
        </div>
      </div>

      {state.status !== "idle" && (
        <Card style={{ marginBottom: 14, borderColor: state.status === "error" ? "var(--danger)" : state.status === "ok" ? "var(--ok)" : "var(--border)" }}>
          <div style={{ fontSize: 12, color: state.status === "error" ? "var(--danger)" : "var(--fg-2)" }}>{state.message}</div>
        </Card>
      )}

      {openForm && (
        <Card style={{ marginBottom: 14 }}>
          <form onSubmit={(event) => void submitManual(event)} style={{ display: "grid", gridTemplateColumns: "110px 1.4fr 1fr 110px 90px 120px auto", gap: 10, alignItems: "end" }}>
            <Field label="Codigo">
              <input required value={form.codigo} style={inputStyle} onChange={(event) => setForm({ ...form, codigo: event.target.value })} />
            </Field>
            <Field label="Disciplina">
              <input required value={form.nome} style={inputStyle} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
            </Field>
            <Field label="Professor">
              <select value={form.professorNome} style={inputStyle} onChange={(event) => setForm({ ...form, professorNome: event.target.value })}>
                <option value="">Sem professor</option>
                {docentes.map((docente) => <option key={docente.id} value={docente.nome}>{docente.nome}</option>)}
              </select>
            </Field>
            <Field label="Periodo">
              <input value={form.periodo} style={inputStyle} onChange={(event) => setForm({ ...form, periodo: event.target.value })} />
            </Field>
            <Field label="Cred.">
              <input type="number" min={0} value={form.creditos} style={inputStyle} onChange={(event) => setForm({ ...form, creditos: Number(event.target.value) })} />
            </Field>
            <Field label="Matriculados">
              <input type="number" min={0} value={form.matriculados} style={inputStyle} onChange={(event) => setForm({ ...form, matriculados: Number(event.target.value) })} />
            </Field>
            <Btn variant="primary" size="md" icon={Ico.check({ size: 13 })} disabled={state.status === "loading"}>Salvar</Btn>
          </form>
        </Card>
      )}

      <Card padding={0}>
        {disciplinas.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 24px", textAlign: "center", color: "var(--muted)" }}>
            <span style={{ color: "var(--muted-2)" }}>{Ico.book({ size: 28 })}</span>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-2)" }}>Nenhuma disciplina no banco real</div>
            <div style={{ fontSize: 12, maxWidth: 460 }}>
              Cadastre manualmente ou importe a planilha semestral de disciplinas lecionadas por professor.
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
