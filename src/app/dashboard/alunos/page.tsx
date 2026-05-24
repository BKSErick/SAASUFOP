/* =========================================================
   Alunos (server) — fetch via data layer + AlunosView client
   ========================================================= */
import { AlunosView } from "./AlunosView";
import { getAlunos, getDocentes } from "@/lib/data";

export default async function AlunosPage() {
  const [alunos, docentes] = await Promise.all([getAlunos(), getDocentes()]);
  return <AlunosView alunos={alunos} docentes={docentes} />;
}
