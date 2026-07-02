"use client";

/* =========================================================
   AlunosView Ã¢â‚¬â€ tabela com filtros + drawer (client)
   Recebe alunos/docentes do server (page.tsx). Labels/helpers
   puros vÃƒÂªm de @/lib/data/mock (LINHAS, HOJE, mesesEntre).
   ========================================================= */
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Pill, Avatar, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import { linhaLabel, HOJE, mesesEntre } from "@/lib/data/mock";
import type { Aluno, Docente } from "@/types/domain";

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  "Cursando": { color: "var(--info)", label: "Cursando" },
  "Qualificado": { color: "var(--ok)", label: "Qualificado" },
  "Defesa marcada": { color: "var(--accent)", label: "Defesa marcada" },
  "Aguard. documentacao": { color: "var(--warn)", label: "Aguard. doc." },
};

function StatusDot({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { color: "var(--muted)", label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

type SortKey = "nome" | "nivel" | "orientador" | "prazo_jubilamento";

interface AlunosViewProps {
  alunos: Aluno[];
  docentes: Docente[];
}

function AlunosInner({ alunos, docentes }: AlunosViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroBolsa, setFiltroBolsa] = useState("Todas");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; dir: "asc" | "desc" }>({ k: "prazo_jubilamento", dir: "asc" });
  const [view, setView] = useState<"list" | "grid">("list");
  const [openId, setOpenId] = useState<string | null>(searchParams.get("id"));

  const totalBolsas = alunos.filter((a) => a.status_bolsa !== "Nenhuma").length;
  const opened = openId ? alunos.find((a) => a.id === openId) ?? null : null;

  const rows = useMemo(() => {
    let r = alunos.slice();
    if (filtroNivel !== "Todos") r = r.filter((a) => a.nivel === filtroNivel);
    if (filtroStatus !== "Todos") r = r.filter((a) => a.status === filtroStatus);
    if (filtroBolsa !== "Todas") r = r.filter((a) => (filtroBolsa === "Sem bolsa" ? a.status_bolsa === "Nenhuma" : a.status_bolsa === filtroBolsa));
    if (q) r = r.filter((a) => (a.nome + " " + a.matricula + " " + a.orientador).toLowerCase().includes(q.toLowerCase()));
    r.sort((a, b) => {
      const va = a[sort.k];
      const vb = b[sort.k];
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [alunos, filtroNivel, filtroStatus, filtroBolsa, q, sort]);

  const toggleSort = (k: SortKey) =>
    setSort((s) => (s.k === k ? { k, dir: s.dir === "asc" ? "desc" : "asc" } : { k, dir: "asc" }));

  const sortHead = (k: SortKey, children: ReactNode) => (
    <button
      onClick={() => toggleSort(k)}
      style={{ background: "transparent", border: "none", padding: 0, color: "inherit", font: "inherit", display: "inline-flex", alignItems: "center", gap: 4, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}
    >
      {children}
      {sort.k === k && <span style={{ display: "inline-flex", transform: sort.dir === "asc" ? "rotate(90deg)" : "rotate(-90deg)" }}>{Ico.chevron({ size: 10 })}</span>}
    </button>
  );

  const GRID_COLS = "minmax(220px, 2.2fr) 100px 130px 1.4fr 1fr 110px 60px";

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Alunos</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{rows.length} de {alunos.length} - {totalBolsas} com bolsa</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm" icon={Ico.download({ size: 13 })} disabled title="Exportacao pendente">Exportar</Btn>
          <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} disabled title="Cadastro manual pendente">Novo aluno</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", minWidth: 260, flex: 1, maxWidth: 360 }}>
          {Ico.search({ size: 13, color: "var(--muted)" })}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, matricula, orientador..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--fg)", fontFamily: "inherit" }} />
        </div>
        <Select value={filtroNivel} onChange={setFiltroNivel} options={["Todos", "Mestrado", "Doutorado"]} label="Nivel" />
        <Select value={filtroStatus} onChange={setFiltroStatus} options={["Todos", "Cursando", "Qualificado", "Defesa marcada", "Aguard. documentacao"]} label="Status" />
        <Select value={filtroBolsa} onChange={setFiltroBolsa} options={["Todas", "CAPES", "CNPq", "FAPEMIG", "PROPP", "Sem bolsa"]} label="Bolsa" />
        <div style={{ marginLeft: "auto", display: "flex", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", padding: 2 }}>
          {(["list", "grid"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "4px 8px", background: view === v ? "var(--inset)" : "transparent", border: "none", borderRadius: 6, color: view === v ? "var(--fg)" : "var(--muted)", display: "flex", alignItems: "center" }}>
              {v === "list" ? Ico.list({ size: 14 }) : Ico.grid({ size: 14 })}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <Card padding={0} style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, padding: "10px 16px", borderBottom: "1px solid var(--divider)", fontSize: 11, color: "var(--muted)" }}>
            {sortHead("nome", "Aluno")}
            {sortHead("nivel", "Nivel")}
            <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Status</span>
            {sortHead("orientador", "Orientador")}
            <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Bolsa</span>
            {sortHead("prazo_jubilamento", "Prazo")}
            <span />
          </div>
          <div className="nice-scroll" style={{ maxHeight: 620, overflowY: "auto" }}>
            {rows.map((a) => {
              const meses = mesesEntre(HOJE, new Date(a.prazo_jubilamento));
              const prazoColor = meses < 0 ? "var(--danger)" : meses < 6 ? "var(--warn)" : "var(--fg-2)";
              return (
                <button key={a.id} onClick={() => setOpenId(a.id)} style={{ display: "grid", gridTemplateColumns: GRID_COLS, width: "100%", padding: "10px 16px", background: "transparent", border: "none", borderBottom: "1px solid var(--divider)", textAlign: "left", color: "var(--fg)", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={a.nome} hue={a.avatar_hue} size={26} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.nome}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--muted)" }}>{a.matricula}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{a.nivel}</span>
                  <StatusDot status={a.status} />
                  <span style={{ fontSize: 12, color: "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.orientador}</span>
                  <span>{a.status_bolsa !== "Nenhuma" ? <Pill tone="accent">{a.status_bolsa}</Pill> : <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>-</span>}</span>
                  <span className="mono tabular" style={{ fontSize: 12, color: prazoColor, fontWeight: 500 }}>{meses < 0 ? "vencido " + -meses + "m" : meses + "m"}</span>
                  <span style={{ color: "var(--muted)", justifySelf: "end" }}>{Ico.chevron({ size: 14 })}</span>
                </button>
              );
            })}
            {rows.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Nenhum aluno corresponde aos filtros.</div>}
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--d-gap)" }}>
          {rows.map((a) => {
            const meses = mesesEntre(HOJE, new Date(a.prazo_jubilamento));
            return (
              <Card key={a.id} onClick={() => setOpenId(a.id)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar name={a.nome} hue={a.avatar_hue} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nome}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{a.matricula} - {a.nivel}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12 }}>
                  <StatusDot status={a.status} />
                  <span className="mono tabular" style={{ color: meses < 0 ? "var(--danger)" : meses < 6 ? "var(--warn)" : "var(--muted)" }}>{meses}m</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {opened && <AlunoDrawer aluno={opened} docentes={docentes} onClose={() => { setOpenId(null); router.replace("/dashboard/alunos"); }} />}
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 8px 5px 10px", fontSize: 12, color: "var(--muted)" }}>
      <span>{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ background: "transparent", border: "none", color: "var(--fg)", fontSize: 12.5, fontFamily: "inherit", outline: "none", cursor: "pointer", fontWeight: 500 }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

function AlunoDrawer({ aluno, docentes, onClose }: { aluno: Aluno; docentes: Docente[]; onClose: () => void }) {
  const orient = docentes.find((d) => d.id === aluno.orientador_id);
  const meses = mesesEntre(HOJE, new Date(aluno.prazo_jubilamento));
  const limite = aluno.nivel === "Mestrado" ? 24 : 48;
  const decorrido = limite - meses;
  const pct = Math.min(100, Math.max(0, (decorrido / limite) * 100));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "color-mix(in oklch, var(--bg) 40%, transparent)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} className="nice-scroll" style={{ width: 520, maxWidth: "100vw", background: "var(--surface)", borderLeft: "1px solid var(--border)", height: "100vh", overflowY: "auto", animation: "slide-in-right var(--t-mid)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--divider)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{aluno.nivel}{aluno.linha >= 0 ? ` - ${linhaLabel(aluno.linha)}` : ""}</span>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--muted)", padding: 2 }}>{Ico.close({ size: 16 })}</button>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar name={aluno.nome} hue={aluno.avatar_hue} size={52} />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.02em" }}>{aluno.nome}</h2>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{aluno.matricula}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="primary" size="sm" icon={Ico.mail({ size: 12 })} disabled title="Envio por SMTP removido do escopo">Enviar e-mail</Btn>
            <Btn variant="secondary" size="sm" icon={Ico.file({ size: 12 })} disabled title="Historico editavel pendente">Historico</Btn>
            <Btn variant="secondary" size="sm" disabled title="Edicao pendente">Editar</Btn>
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Prazo de jubilamento</span>
              <span className="mono tabular" style={{ fontSize: 12, color: meses < 0 ? "var(--danger)" : meses < 6 ? "var(--warn)" : "var(--fg-2)", fontWeight: 500 }}>
                {meses < 0 ? "Vencido ha " + -meses + " meses" : meses + " meses restantes"}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--inset)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ width: pct + "%", height: "100%", background: meses < 0 ? "var(--danger)" : pct > 80 ? "var(--warn)" : "var(--accent)", borderRadius: 100 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "var(--muted-2)", fontFamily: "var(--font-mono)" }}>
              <span>Ingresso - {aluno.ingresso ? new Date(aluno.ingresso).toLocaleDateString("pt-BR") : "-"}</span>
              <span>Limite - {aluno.prazo_jubilamento ? new Date(aluno.prazo_jubilamento).toLocaleDateString("pt-BR") : "-"}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Info label="Status" value={<StatusDot status={aluno.status} />} />
            <Info label="Bolsa" value={aluno.status_bolsa !== "Nenhuma" ? <Pill tone="accent">{aluno.status_bolsa}</Pill> : <span style={{ color: "var(--muted)" }}>Sem bolsa</span>} />
            <Info label="Orientador" value={<span style={{ fontWeight: 500 }}>{aluno.orientador}</span>} />
            <Info label="Linha de pesquisa" value={linhaLabel(aluno.linha)} />
            <Info label="Creditos cursados" value={<span className="mono">{aluno.creditos}/96</span>} />
            <Info label="Producoes vinculadas" value={<span className="mono">{aluno.producoes}</span>} />
          </div>

          <div>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Historico</h3>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 1, background: "var(--divider)" }} />
              {[
                { d: "14 Mai 2026", t: "Matricula confirmada - 2026/1", n: "Sistema SRA" },
                { d: "02 Mar 2026", t: "Qualificacao aprovada", n: "Banca: " + (orient?.nome || "-") + " (orient.)" },
                { d: "12 Out 2025", t: "Producao registrada - QUALIS A2", n: "\"Edge replication strategies...\"" },
                { d: "01 Ago 2024", t: "Inicio do programa", n: "Ingresso via processo seletivo 2024/2" },
              ].map((h, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: 14 }}>
                  <span style={{ position: "absolute", left: -19, top: 4, width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--surface)", border: "1.5px solid var(--border-strong)" }} />
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{h.d}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{h.t}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{h.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlunosView({ alunos, docentes }: AlunosViewProps) {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--muted)" }}>Carregando...</div>}>
      <AlunosInner alunos={alunos} docentes={docentes} />
    </Suspense>
  );
}
