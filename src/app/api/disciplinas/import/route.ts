import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  normalizeDisciplinaProfessor,
  parseDisciplinasSpreadsheet,
  type DisciplinaImportRow,
} from "@/lib/disciplinas-spreadsheet";

export const runtime = "nodejs";

type ProfessorLookup = {
  id: string;
  nome: string;
};

function professorIdByName(name: string | null, professores: ProfessorLookup[]) {
  if (!name) return null;
  const target = normalizeDisciplinaProfessor(name);
  const exact = professores.find((professor) => normalizeDisciplinaProfessor(professor.nome) === target);
  if (exact) return exact.id;
  const partial = professores.find((professor) => {
    const professorName = normalizeDisciplinaProfessor(professor.nome);
    return professorName.includes(target) || target.includes(professorName);
  });
  return partial?.id ?? null;
}

async function upsertDisciplina(row: DisciplinaImportRow & { professor_id: string | null }) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("disciplinas")
    .select("id")
    .eq("codigo", row.codigo)
    .eq("periodo", row.periodo)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (findError) throw findError;

  const payload = {
    codigo: row.codigo,
    nome: row.nome,
    creditos: row.creditos,
    periodo: row.periodo,
    matriculados: row.matriculados,
    professor_id: row.professor_id,
  };

  if (existing?.id) {
    const { error } = await supabaseAdmin.from("disciplinas").update(payload).eq("id", existing.id);
    if (error) throw error;
    return "updated" as const;
  }

  const { error } = await supabaseAdmin.from("disciplinas").insert(payload);
  if (error) throw error;
  return "inserted" as const;
}

async function rowsFromRequest(request: Request): Promise<DisciplinaImportRow[]> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json() as {
      codigo?: string;
      nome?: string;
      creditos?: number;
      periodo?: string;
      matriculados?: number;
      professorNome?: string | null;
    };

    if (!body.codigo || !body.nome) {
      throw new Error("Codigo e nome da disciplina sao obrigatorios.");
    }

    return [{
      codigo: body.codigo.trim(),
      nome: body.nome.trim(),
      creditos: Number.isFinite(body.creditos) ? Number(body.creditos) : 4,
      periodo: body.periodo?.trim() ?? "",
      matriculados: Number.isFinite(body.matriculados) ? Number(body.matriculados) : 0,
      professor_nome: body.professorNome?.trim() || null,
    }];
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new Error("Arquivo obrigatorio.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return parseDisciplinasSpreadsheet(buffer);
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const rows = await rowsFromRequest(request);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Nenhuma disciplina valida encontrada." }, { status: 422 });
    }

    const { data: professores, error: professoresError } = await supabaseAdmin
      .from("professores")
      .select("id, nome")
      .returns<ProfessorLookup[]>();

    if (professoresError) throw professoresError;

    let inserted = 0;
    let updated = 0;
    const unmatchedProfessores = new Set<string>();

    for (const row of rows) {
      const professor_id = professorIdByName(row.professor_nome, professores ?? []);
      if (row.professor_nome && !professor_id) unmatchedProfessores.add(row.professor_nome);

      const result = await upsertDisciplina({ ...row, professor_id });
      if (result === "inserted") inserted += 1;
      else updated += 1;
    }

    return NextResponse.json({
      imported: rows.length,
      inserted,
      updated,
      unmatchedProfessores: unmatchedProfessores.size,
      unmatchedProfessorSamples: Array.from(unmatchedProfessores).slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao importar disciplinas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
