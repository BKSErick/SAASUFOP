"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import type { Aluno, Banca } from "@/types/domain";

type ImportState = {
  status: "idle" | "loading" | "ok" | "error";
  message: string;
};

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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5, color: "var(--muted)" }}>
      {label}
      {children}
    </label>
  );
}

export function BancasView({
  bancas,
  alunos,
  bancasAgendadas,
  proximasDefesas,
  today,
}: {
  bancas: Banca[];
  alunos: Aluno[];
  bancasAgendadas: number;
  proximasDefesas: number;
  today: Date;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openForm, setOpenForm] = useState(false);
  const [state, setState] = useState<ImportState>({ status: "idle", message: "" });
  const [form, setForm] = useState({
    matricula: "",
    alunoNome: "",
    titulo: "",
    tipo: "Defesa" as "Defesa" | "Qualificação",
    dataHora: "",
    local: "",
    linkTransmissao: "",
  });

  const calendarYear = today.getFullYear();
  const calendarMonth = today.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const dayToday = today.getDate();
  const monthLabel = today.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  const bancasByDay: Record<number, Banca[]> = {};

  bancas.forEach((b) => {
    const d = new Date(b.data);
    if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
      const day = d.getDate();
      (bancasByDay[day] = bancasByDay[day] || []).push(b);
    }
  });

  async function upload(file: File) {
    setState({ status: "loading", message: `Importando ${file.name}...` });
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/bancas/import", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || data?.error || "Falha ao importar bancas");
      setState({
        status: "ok",
        message: `${data.imported ?? 0} bancas processadas; ${data.inserted ?? 0} novas; ${data.updated ?? 0} atualizadas; ${data.unmatchedAlunos ?? 0} sem aluno vinculado.`,
      });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Falha ao importar bancas" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function submitManual(event: FormEvent) {
    event.preventDefault();
    setState({ status: "loading", message: "Salvando banca..." });

    try {
      const response = await fetch("/api/bancas/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || data?.error || "Falha ao salvar banca");
      setState({ status: "ok", message: "Banca salva no Supabase." });
      setOpenForm(false);
      setForm((current) => ({ ...current, titulo: "", dataHora: "", local: "", linkTransmissao: "" }));
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Falha ao salvar banca" });
    }
  }

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Bancas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{bancasAgendadas} agendadas - {proximasDefesas} defesas em 6 meses</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Btn variant="secondary" size="sm" icon={Ico.upload({ size: 13 })} disabled={state.status === "loading"} onClick={() => fileInputRef.current?.click()}>
            Importar planilha
          </Btn>
          <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} onClick={() => setOpenForm((value) => !value)}>
            Agendar banca
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
          <form onSubmit={(event) => void submitManual(event)} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 120px 180px 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Aluno">
              <select
                value={form.matricula}
                required
                style={inputStyle}
                onChange={(event) => {
                  const aluno = alunos.find((item) => item.matricula === event.target.value);
                  setForm({ ...form, matricula: event.target.value, alunoNome: aluno?.nome ?? "" });
                }}
              >
                <option value="">Selecionar aluno</option>
                {alunos.map((aluno) => <option key={aluno.id} value={aluno.matricula}>{aluno.nome}</option>)}
              </select>
            </Field>
            <Field label="Titulo">
              <input required value={form.titulo} style={inputStyle} onChange={(event) => setForm({ ...form, titulo: event.target.value })} />
            </Field>
            <Field label="Tipo">
              <select value={form.tipo} style={inputStyle} onChange={(event) => setForm({ ...form, tipo: event.target.value as "Defesa" | "Qualificação" })}>
                <option value="Defesa">Defesa</option>
                <option value="Qualificação">Qualificação</option>
              </select>
            </Field>
            <Field label="Data/hora">
              <input required type="datetime-local" value={form.dataHora} style={inputStyle} onChange={(event) => setForm({ ...form, dataHora: event.target.value })} />
            </Field>
            <Field label="Local">
              <input value={form.local} style={inputStyle} onChange={(event) => setForm({ ...form, local: event.target.value })} />
            </Field>
            <Btn variant="primary" size="md" icon={Ico.check({ size: 13 })} disabled={state.status === "loading"}>Salvar</Btn>
          </form>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--d-gap)" }}>
        <Card padding={0}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{monthLabel}</h3>
            <div style={{ display: "flex", gap: 4 }}>
              <Btn variant="ghost" size="sm" style={{ padding: 6 }} disabled title="Navegacao de calendario pendente"><span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>{Ico.chevron({ size: 14 })}</span></Btn>
              <Btn variant="ghost" size="sm" disabled title="Navegacao de calendario pendente">Hoje</Btn>
              <Btn variant="ghost" size="sm" style={{ padding: 6 }} disabled title="Navegacao de calendario pendente">{Ico.chevron({ size: 14 })}</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d, i) => (
              <div key={i} style={{ padding: "8px 10px", fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--divider)" }}>{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - firstDay + 1;
              const valid = day >= 1 && day <= daysInMonth;
              const isToday = day === dayToday;
              const events = bancasByDay[day] || [];
              return (
                <div key={i} style={{ minHeight: 96, padding: 8, borderRight: i % 7 !== 6 ? "1px solid var(--divider)" : "none", borderBottom: "1px solid var(--divider)", opacity: valid ? 1 : 0.3, background: isToday ? "color-mix(in oklch, var(--accent) 5%, var(--surface))" : "transparent", position: "relative" }}>
                  {valid && (
                    <>
                      <span className="mono tabular" style={{ fontSize: 12, fontWeight: isToday ? 600 : 400, color: isToday ? "var(--accent)" : "var(--fg-2)" }}>{day}</span>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                        {events.map((e) => (
                          <div key={e.id} style={{ fontSize: 10.5, padding: "2px 5px", borderRadius: 4, background: e.tipo === "Defesa" ? "var(--accent-soft)" : "var(--info-soft)", color: e.tipo === "Defesa" ? "var(--accent-soft-fg)" : "var(--info)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{e.tipo[0]} - {e.aluno.split(" ")[0]}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Proximas</div>
          {bancas.length === 0 && (
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>
              <span style={{ color: "var(--muted-2)" }}>{Ico.calendar({ size: 24 })}</span>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>Nenhuma banca agendada</div>
              <div style={{ fontSize: 11.5 }}>Cadastre manualmente ou importe a planilha do formulario de defesas.</div>
            </Card>
          )}
          {bancas.map((b) => {
            const dt = new Date(b.data);
            return (
              <Card key={b.id} style={{ display: "flex", gap: 12, padding: "14px 16px" }}>
                <div style={{ width: 46, flexShrink: 0, background: b.tipo === "Defesa" ? "var(--accent-soft)" : "var(--info-soft)", color: b.tipo === "Defesa" ? "var(--accent-soft-fg)" : "var(--info)", borderRadius: 6, padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 600 }}>{dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 400 }}>{dt.getDate()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Pill tone={b.tipo === "Defesa" ? "accent" : "info"} style={{ fontSize: 9.5 }}>{b.tipo}</Pill>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 4, lineHeight: 1.3 }}>{b.aluno}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{b.local || "-"}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
