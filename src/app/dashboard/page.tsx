import { DashboardView, type AlertRow } from "./DashboardView";
import { getDashboardKpis, getDocentes, getBancas, HOJE, mesesEntre } from "@/lib/data";

export default async function DashboardPage() {
  const [kpis, docentes, bancas] = await Promise.all([
    getDashboardKpis(),
    getDocentes(),
    getBancas(),
  ]);

  const alerts: AlertRow[] = [
    ...kpis.alertaVencido.map((a) => ({
      id: a.id,
      nome: a.nome,
      nivel: a.nivel,
      orientador: a.orientador,
      avatar_hue: a.avatar_hue,
      prazo_jubilamento: a.prazo_jubilamento,
      severity: "danger" as const,
      meses: -mesesEntre(HOJE, new Date(a.prazo_jubilamento)),
      reason: "Prazo excedido",
    })),
    ...kpis.alertaPerto.slice(0, 6).map((a) => ({
      id: a.id,
      nome: a.nome,
      nivel: a.nivel,
      orientador: a.orientador,
      avatar_hue: a.avatar_hue,
      prazo_jubilamento: a.prazo_jubilamento,
      severity: "warn" as const,
      meses: mesesEntre(HOJE, new Date(a.prazo_jubilamento)),
      reason: "Proximo do jubilamento",
    })),
    ...kpis.aguardandoDoc.slice(0, 3).map((a) => ({
      id: a.id,
      nome: a.nome,
      nivel: a.nivel,
      orientador: a.orientador,
      avatar_hue: a.avatar_hue,
      prazo_jubilamento: a.prazo_jubilamento,
      severity: "info" as const,
      meses: null,
      reason: "Aguardando documentacao",
    })),
  ].slice(0, 8);

  const topDocentes = [...docentes].sort((a, b) => b.orientandos - a.orientandos).slice(0, 6);

  return (
    <DashboardView
      totalAlunos={kpis.totalAlunos}
      totalBolsas={kpis.totalBolsas}
      totalA1A2={kpis.totalA1A2}
      bancasAgendadas={kpis.bancasAgendadas}
      proximasDefesas={kpis.proximasDefesas}
      alertaVencidoCount={kpis.alertaVencido.length}
      alertaPertoCount={kpis.alertaPerto.length}
      bolsasPorAgencia={kpis.bolsasPorAgencia}
      topDocentes={topDocentes}
      proximasBancas={bancas.slice(0, 3)}
      alerts={alerts}
    />
  );
}
