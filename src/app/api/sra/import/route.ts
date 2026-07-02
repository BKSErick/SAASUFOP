import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeSraName, parseSraSpreadsheet } from "@/lib/sra-spreadsheet";

export const runtime = "nodejs";

type ProfessorLookup = {
  id: string;
  nome: string;
};

function matchProfessorId(orientadorNome: string | null, professores: ProfessorLookup[]) {
  if (!orientadorNome) return null;
  const target = normalizeSraName(orientadorNome);
  const exact = professores.find((professor) => normalizeSraName(professor.nome) === target);
  if (exact) return exact.id;

  const partial = professores.find((professor) => {
    const professorName = normalizeSraName(professor.nome);
    return professorName.includes(target) || target.includes(professorName);
  });

  return partial?.id ?? null;
}

async function refreshProfessorCounts() {
  const { data: alunos, error: alunosError } = await supabaseAdmin
    .from("alunos")
    .select("professor_orientador_id")
    .not("professor_orientador_id", "is", null);

  if (alunosError) throw alunosError;

  const counts = new Map<string, number>();
  for (const aluno of alunos ?? []) {
    const professorId = aluno.professor_orientador_id as string | null;
    if (professorId) counts.set(professorId, (counts.get(professorId) ?? 0) + 1);
  }

  const { data: professores, error: professoresError } = await supabaseAdmin
    .from("professores")
    .select("id");

  if (professoresError) throw professoresError;

  for (const professor of professores ?? []) {
    const { error } = await supabaseAdmin
      .from("professores")
      .update({ orientandos_count: counts.get(professor.id as string) ?? 0 })
      .eq("id", professor.id);

    if (error) throw error;
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatorio" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseSraSpreadsheet(buffer, file.name);

    const { data: professores, error: professoresError } = await supabaseAdmin
      .from("professores")
      .select("id, nome")
      .returns<ProfessorLookup[]>();

    if (professoresError) throw professoresError;

    const unmatchedOrientadores = new Set<string>();
    let matchedOrientadores = 0;
    let missingPrazo = 0;

    const payload = parsed.rows.map((row) => {
      const professorId = matchProfessorId(row.orientador_nome, professores ?? []);
      if (row.orientador_nome) {
        if (professorId) matchedOrientadores += 1;
        else unmatchedOrientadores.add(row.orientador_nome);
      }
      if (!row.prazo_jubilamento) missingPrazo += 1;

      return {
        nome: row.nome,
        matricula: row.matricula,
        email: row.email,
        data_ingresso: row.data_ingresso,
        status_bolsa: row.status_bolsa,
        status: row.status,
        prazo_jubilamento: row.prazo_jubilamento,
        professor_orientador_id: professorId,
        nivel: row.nivel,
        creditos: row.creditos,
        producoes_count: 0,
        avatar_hue: row.avatar_hue,
      };
    });

    const { error: upsertError } = await supabaseAdmin
      .from("alunos")
      .upsert(payload, { onConflict: "matricula" });

    if (upsertError) throw upsertError;

    await refreshProfessorCounts();

    return NextResponse.json({
      imported: payload.length,
      totalRows: parsed.totalRows,
      matchedOrientadores,
      unmatchedOrientadores: unmatchedOrientadores.size,
      unmatchedOrientadorSamples: Array.from(unmatchedOrientadores).slice(0, 10),
      missingPrazo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao importar planilha SRA",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
