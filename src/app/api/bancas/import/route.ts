import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  normalizeBancaLookup,
  parseBancasSpreadsheet,
  type BancaImportRow,
} from "@/lib/bancas-spreadsheet";

export const runtime = "nodejs";

type AlunoLookup = {
  id: string;
  nome: string;
  matricula: string;
};

function matchAluno(row: BancaImportRow, alunos: AlunoLookup[]) {
  if (row.matricula) {
    const target = normalizeBancaLookup(row.matricula);
    const byMatricula = alunos.find((aluno) => normalizeBancaLookup(aluno.matricula) === target);
    if (byMatricula) return byMatricula.id;
  }

  if (row.aluno_nome) {
    const target = normalizeBancaLookup(row.aluno_nome);
    const exact = alunos.find((aluno) => normalizeBancaLookup(aluno.nome) === target);
    if (exact) return exact.id;

    const partial = alunos.find((aluno) => {
      const name = normalizeBancaLookup(aluno.nome);
      return name.includes(target) || target.includes(name);
    });
    if (partial) return partial.id;
  }

  return null;
}

async function rowsFromRequest(request: Request): Promise<BancaImportRow[]> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json() as {
      alunoNome?: string | null;
      matricula?: string | null;
      titulo?: string;
      tipo?: "Defesa" | "Qualificação";
      dataHora?: string;
      local?: string | null;
      linkTransmissao?: string | null;
    };

    if (!body.titulo || !body.dataHora) {
      throw new Error("Titulo e data/hora da banca sao obrigatorios.");
    }

    return [{
      aluno_nome: body.alunoNome?.trim() || null,
      matricula: body.matricula?.trim() || null,
      titulo_trabalho: body.titulo.trim(),
      tipo: body.tipo === "Qualificação" ? "Qualificação" : "Defesa",
      data_hora: body.dataHora,
      local: body.local?.trim() || null,
      link_transmissao: body.linkTransmissao?.trim() || null,
    }];
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo obrigatorio.");

  return parseBancasSpreadsheet(Buffer.from(await file.arrayBuffer()));
}

async function upsertBanca(row: BancaImportRow, alunoId: string | null) {
  let existingQuery = supabaseAdmin
    .from("bancas")
    .select("id")
    .eq("tipo", row.tipo)
    .eq("data_hora", row.data_hora)
    .limit(1);

  existingQuery = alunoId ? existingQuery.eq("aluno_id", alunoId) : existingQuery.is("aluno_id", null);

  const { data: existing, error: findError } = await existingQuery.maybeSingle<{ id: string }>();

  if (findError) throw findError;

  const payload = {
    aluno_id: alunoId,
    titulo_trabalho: row.titulo_trabalho,
    tipo: row.tipo,
    data_hora: row.data_hora,
    local: row.local,
    link_transmissao: row.link_transmissao,
    status_publicacao_site: false,
  };

  if (existing?.id) {
    const { error } = await supabaseAdmin.from("bancas").update(payload).eq("id", existing.id);
    if (error) throw error;
    return "updated" as const;
  }

  const { error } = await supabaseAdmin.from("bancas").insert(payload);
  if (error) throw error;
  return "inserted" as const;
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const rows = await rowsFromRequest(request);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Nenhuma banca valida encontrada." }, { status: 422 });
    }

    const { data: alunos, error: alunosError } = await supabaseAdmin
      .from("alunos")
      .select("id, nome, matricula")
      .returns<AlunoLookup[]>();

    if (alunosError) throw alunosError;

    let inserted = 0;
    let updated = 0;
    const unmatchedAlunos = new Set<string>();

    for (const row of rows) {
      const alunoId = matchAluno(row, alunos ?? []);
      if (!alunoId) unmatchedAlunos.add(row.matricula || row.aluno_nome || row.titulo_trabalho);

      const result = await upsertBanca(row, alunoId);
      if (result === "inserted") inserted += 1;
      else updated += 1;
    }

    return NextResponse.json({
      imported: rows.length,
      inserted,
      updated,
      unmatchedAlunos: unmatchedAlunos.size,
      unmatchedAlunoSamples: Array.from(unmatchedAlunos).slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao importar bancas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
