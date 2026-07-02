import { getDisciplinas, getDocentes } from "@/lib/data";
import { DisciplinasView } from "./DisciplinasView";

export default async function DisciplinasPage() {
  const [disciplinas, docentes] = await Promise.all([getDisciplinas(), getDocentes()]);
  return <DisciplinasView disciplinas={disciplinas} docentes={docentes} />;
}
