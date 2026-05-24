/* =========================================================
   Docentes (server) — fetch via data layer + DocentesView client
   ========================================================= */
import { DocentesView } from "./DocentesView";
import { getDocentes } from "@/lib/data";

export default async function DocentesPage() {
  const docentes = await getDocentes();
  return <DocentesView docentes={docentes} />;
}
