/* =========================================================
   Dashboard layout (server) — AppShell + command data real
   Auth protegida pelo middleware (/dashboard/:path*). Busca
   alunos/docentes para o command palette e o email da sessão.
   ========================================================= */
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import type { CommandItem } from "@/components/layout/CommandPalette";
import { getAlunos, getDocentes } from "@/lib/data";
import { linhaLabel } from "@/lib/data/mock";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [alunos, docentes] = await Promise.all([getAlunos(), getDocentes()]);

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "coord.ppgep@ufop.br";

  const commandItems: CommandItem[] = [
    ...alunos.map((a) => ({ type: "Aluno", label: a.nome, hint: `${a.matricula} · ${a.nivel}`, href: `/dashboard/alunos?id=${a.id}` })),
    ...docentes.map((d) => ({ type: "Docente", label: d.nome, hint: linhaLabel(d.linha), href: "/dashboard/docentes" })),
    { type: "Página", label: "Painel", hint: "Visão geral", href: "/dashboard" },
    { type: "Página", label: "Qualidade CAPES", hint: "Métricas + QUALIS", href: "/dashboard/qualidade" },
    { type: "Página", label: "Bancas", hint: "Defesas e qualificações", href: "/dashboard/bancas" },
    { type: "Página", label: "Relatórios CAPES", hint: "Exportações", href: "/dashboard/relatorios" },
  ];

  return (
    <AppShell commandItems={commandItems} userName="Coordenação PPGEP" userEmail={email}>
      {children}
    </AppShell>
  );
}
