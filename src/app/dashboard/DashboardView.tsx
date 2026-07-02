"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, Avatar, Btn, Section, type PillTone } from "@/components/ui/primitives";
import { Donut, HBars } from "@/components/charts";
import { Ico } from "@/components/icons";
import type { Banca, Docente } from "@/types/domain";

export interface AlertRow {
  id: string;
  nome: string;
  nivel: string;
  orientador: string;
  avatar_hue: number;
  prazo_jubilamento: string | null;
  severity: "danger" | "warn" | "info";
  meses: number | null;
  reason: string;
}

export interface DashboardViewProps {
  totalAlunos: number;
  totalBolsas: number;
  totalA1A2: number;
  bancasAgendadas: number;
  proximasDefesas: number;
  alertaVencidoCount: number;
  alertaPertoCount: number;
  bolsasPorAgencia: Record<string, number>;
  topDocentes: Docente[];
  proximasBancas: Banca[];
  alerts: AlertRow[];
}

const PALETTE = ["var(--accent)", "var(--info)", "var(--warn)", "var(--ok)"];

type SraImportState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

interface KpiProps {
  label: string;
  value: ReactNode;
  sub: string;
  accent?: string;
  tag?: { text: string; tone: PillTone };
}

function KPI({ label, value, sub, accent, tag }: KpiProps) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 120, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.02em", fontWeight: 500 }}>{label}</span>
        {tag && <Pill tone={tag.tone}>{tag.text}</Pill>}
      </div>
      <div className="mono tabular" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1, color: accent || "var(--fg)" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{sub}</div>
    </Card>
  );
}

function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
      <span style={{ color: "var(--muted-2)" }}>{icon}</span>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>{title}</div>
      <div style={{ fontSize: 12, maxWidth: 360 }}>{hint}</div>
    </div>
  );
}

export function DashboardView(props: DashboardViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sraImport, setSraImport] = useState<SraImportState>({ status: "idle", message: "" });
  const {
    totalAlunos, totalBolsas, totalA1A2, bancasAgendadas, proximasDefesas,
    alertaVencidoCount, alertaPertoCount, bolsasPorAgencia, topDocentes,
    proximasBancas, alerts,
  } = props;

  const cobertura = totalAlunos > 0 ? Math.round((totalBolsas / totalAlunos) * 100) : 0;
  const bolsasDonut = Object.entries(bolsasPorAgencia).map(([k, v], i) => ({ label: k, value: v, color: PALETTE[i % PALETTE.length] }));
  const sevColor = (s: AlertRow["severity"]) => (s === "danger" ? "var(--danger)" : s === "warn" ? "var(--warn)" : "var(--info)");

  async function handleSraFile(file: File | undefined) {
    if (!file) return;
    setSraImport({ status: "loading", message: `Importando ${file.name}...` });

    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch("/api/sra/import", { method: "POST", body: form });
      const payload = await response.json().catch(() => null) as {
        imported?: number;
        matchedOrientadores?: number;
        unmatchedOrientadores?: number;
        missingPrazo?: number;
        bancas?: { inserted?: number; updated?: number; skipped?: number };
        error?: string;
        details?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.details || payload?.error || "Falha ao importar SRA");
      }

      const imported = payload?.imported ?? 0;
      const matched = payload?.matchedOrientadores ?? 0;
      const unmatched = payload?.unmatchedOrientadores ?? 0;
      const missingPrazo = payload?.missingPrazo ?? 0;
      const bancas = payload?.bancas;
      const bancasCount = (bancas?.inserted ?? 0) + (bancas?.updated ?? 0);
      const extras = [
        `${matched} orientadores vinculados`,
        bancas ? `${bancasCount} bancas de defesa sincronizadas` : null,
        unmatched > 0 ? `${unmatched} sem vinculo` : null,
        missingPrazo > 0 ? `${missingPrazo} sem prazo` : null,
      ].filter(Boolean).join("; ");

      setSraImport({ status: "success", message: `${imported} alunos importados. ${extras}.` });
      router.refresh();
    } catch (error) {
      setSraImport({
        status: "error",
        message: error instanceof Error ? error.message : "Falha ao importar SRA",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
            Coordenacao PPGEP - Eng. Producao - UFOP
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 500, letterSpacing: "-0.025em", fontFamily: "var(--font-serif)" }}>
            Painel de gestao academica
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted)", maxWidth: 540 }}>
            <strong style={{ color: "var(--danger)", fontWeight: 500 }}>{alertaVencidoCount} alunos</strong> com prazo excedido
            e <strong style={{ color: "var(--warn)", fontWeight: 500 }}>{alertaPertoCount}</strong> proximos do jubilamento exigem atencao.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="secondary" size="sm" icon={Ico.mail({ size: 13 })} disabled title="Envio por SMTP removido do escopo">Enviar alertas</Btn>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            style={{ display: "none" }}
            onChange={(event) => void handleSraFile(event.target.files?.[0])}
          />
          <Btn
            variant="primary"
            size="sm"
            icon={Ico.upload({ size: 13 })}
            disabled={sraImport.status === "loading"}
            onClick={() => fileInputRef.current?.click()}
          >
            {sraImport.status === "loading" ? "Importando..." : "Importar SRA"}
          </Btn>
        </div>
      </div>

      {sraImport.status !== "idle" && (
        <div
          role="status"
          style={{
            marginTop: -8,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid",
            borderColor: sraImport.status === "error" ? "var(--danger)" : "var(--border)",
            background: sraImport.status === "error"
              ? "color-mix(in oklch, var(--danger) 8%, transparent)"
              : "var(--surface)",
            color: sraImport.status === "error" ? "var(--danger)" : "var(--fg-2)",
            fontSize: 12,
          }}
        >
          {sraImport.message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--d-gap)" }}>
        <KPI label="Alunos ativos" value={totalAlunos} sub={`${totalBolsas} com bolsa - ${cobertura}% cobertura`} />
        <KPI label="Producao QUALIS A1/A2" value={totalA1A2} sub="Planilhas docentes + crosswalk" accent="var(--info)" />
        <KPI label="Bancas agendadas" value={bancasAgendadas} sub={`${proximasDefesas} defesas - proximos 6 meses`} accent="var(--warn)" />
        <KPI label="Alertas criticos" value={String(alertaVencidoCount + alertaPertoCount).padStart(2, "0")} sub={`${alertaVencidoCount} vencidos - ${alertaPertoCount} em alerta`} accent="var(--danger)" tag={{ text: "Acao", tone: "danger" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--d-gap)" }}>
        <Card padding={0}>
          <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Linha do tempo de prazos</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>Alunos ordenados por urgencia de jubilamento</p>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => router.push("/dashboard/alunos")}>Ver todos</Btn>
          </div>
          <div style={{ padding: "6px 8px 12px" }}>
            {alerts.length === 0 && (
              <EmptyState icon={Ico.check({ size: 22 })} title="Nenhum alerta de prazo" hint="Nenhum aluno com prazo excedido ou proximo do jubilamento nos proximos 6 meses." />
            )}
            {alerts.map((a, i) => (
              <button
                key={i}
                onClick={() => router.push(`/dashboard/alunos?id=${a.id}`)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 8, background: "transparent", border: "none", textAlign: "left", color: "var(--fg)" }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor(a.severity), boxShadow: `0 0 0 4px color-mix(in oklch, ${sevColor(a.severity)} 20%, transparent)`, flexShrink: 0 }} />
                <Avatar name={a.nome} hue={a.avatar_hue} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{a.nome}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>- {a.nivel} - {a.orientador}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{a.reason}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {a.meses != null && (
                    <div className="mono tabular" style={{ fontSize: 13, color: a.severity === "danger" ? "var(--danger)" : a.severity === "warn" ? "var(--warn)" : "var(--fg-2)", fontWeight: 500 }}>
                      {a.meses > 0 ? "+" : ""}{a.meses}m
                    </div>
                  )}
                  <div style={{ fontSize: 10.5, color: "var(--muted-2)" }}>
                    {a.prazo_jubilamento && new Date(a.prazo_jubilamento).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--d-gap)" }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Bolsas por agencia</h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>{totalBolsas} ativas</p>
              </div>
            </div>
            {totalBolsas > 0 ? (
              <Donut data={bolsasDonut} size={130} thickness={14} label="bolsas" />
            ) : (
              <EmptyState icon={Ico.chart({ size: 20 })} title="Sem bolsas registradas" hint="Nenhum aluno com bolsa ativa no momento." />
            )}
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Cobertura de bolsa</h3>
            <span className="mono tabular" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>{cobertura}%</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{totalBolsas} de {totalAlunos} alunos com bolsa</span>
            <div style={{ height: 6, background: "var(--inset)", borderRadius: 100, overflow: "hidden", marginTop: 2 }}>
              <div style={{ width: `${cobertura}%`, height: "100%", background: "var(--accent)", borderRadius: 100 }} />
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--d-gap)" }}>
        <Card>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Producao qualificada</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>Extrato QUALIS por mes</p>
          </div>
          <EmptyState icon={Ico.file({ size: 22 })} title="Sem producoes registradas" hint="As producoes academicas serao preenchidas pelas planilhas de curriculo anexadas por docente ou XML Lattes." />
        </Card>

        <Card>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Carga de orientacao</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>Top docentes - orientandos ativos</p>
          </div>
          {topDocentes.length > 0 ? (
            <HBars data={topDocentes.map((d) => ({ label: d.nome, value: d.orientandos }))} />
          ) : (
            <EmptyState icon={Ico.docente({ size: 20 })} title="Sem docentes" hint="Nenhum orientador cadastrado." />
          )}
        </Card>
      </div>

      <Section title="Proximas bancas" hint="Defesas e qualificacoes agendadas" action={<Btn variant="ghost" size="sm" onClick={() => router.push("/dashboard/bancas")}>Abrir calendario</Btn>}>
        {proximasBancas.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--d-gap)" }}>
            {proximasBancas.map((b) => {
              const dt = new Date(b.data);
              const dia = dt.getDate();
              const mes = dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
              const hora = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              return (
                <Card key={b.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 60, flexShrink: 0, background: "var(--inset)", borderRadius: 8, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.06em" }}>{mes}</div>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1 }}>{dia}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{hora}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Pill tone={b.tipo === "Defesa" ? "accent" : "info"}>{b.tipo}</Pill>
                    <h4 style={{ margin: "8px 0 4px", fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{b.titulo}</h4>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)" }}>{b.aluno} - {b.local}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState icon={Ico.calendar({ size: 22 })} title="Nenhuma banca agendada" hint="As bancas marcadas aparecerao aqui quando a fonte real for importada." />
          </Card>
        )}
      </Section>
    </div>
  );
}
