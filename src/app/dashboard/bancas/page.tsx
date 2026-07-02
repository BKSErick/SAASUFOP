import { getAlunos, getBancas, getDashboardKpis, HOJE } from "@/lib/data";
import { BancasView } from "./BancasView";

export default async function BancasPage() {
  const [bancas, alunos, kpis] = await Promise.all([getBancas(), getAlunos(), getDashboardKpis()]);

  return (
    <BancasView
      bancas={bancas}
      alunos={alunos}
      bancasAgendadas={kpis.bancasAgendadas}
      proximasDefesas={kpis.proximasDefesas}
      today={HOJE}
    />
  );
}
