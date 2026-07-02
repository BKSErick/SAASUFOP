import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireApiAuth } from "@/lib/api-auth";
import { parseQualitySpreadsheet, summarizeQualityRows } from "@/lib/quality-spreadsheet";
import { runCrosswalk } from "@/lib/jcr-crosswalk";

export const runtime = "nodejs";

const getServiceClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const form = await request.formData();
    const professorId = String(form.get("professorId") ?? "");
    const file = form.get("file");

    if (!professorId) {
      return NextResponse.json({ error: "professorId obrigatorio" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatorio" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseQualitySpreadsheet(buffer, file.name);
    const summary = summarizeQualityRows(rows);
    const validRows = rows.filter((row) => row.titulo.trim().length > 0);

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma publicacao valida encontrada na planilha", summary },
        { status: 422 },
      );
    }

    const supabase = getServiceClient();
    const payload = validRows.map((row) => ({
      professor_id: professorId,
      titulo: row.titulo.trim(),
      journal: row.journal,
      issn: row.issn,
      doi: row.doi,
      qualis: row.qualis,
      jcr_quartile: row.jcrQuartile,
      link_scopus: row.linkScopus,
      data_publicacao: row.dataPublicacao,
    }));

    const { error: insertError } = await supabase
      .from("producoes")
      .upsert(payload, { onConflict: "professor_id,titulo" });

    if (insertError) throw insertError;

    const { count, error: countError } = await supabase
      .from("producoes")
      .select("id", { count: "exact", head: true })
      .eq("professor_id", professorId);

    if (countError) throw countError;

    const { error: professorError } = await supabase
      .from("professores")
      .update({
        producao_count: count ?? validRows.length,
        lattes_updated_at: new Date().toISOString(),
      })
      .eq("id", professorId);

    if (professorError) throw professorError;

    let jcrCrosswalk = null;
    try {
      jcrCrosswalk = await runCrosswalk();
    } catch {
      jcrCrosswalk = { skipped: true, reason: "Base JCR ausente ou crosswalk indisponivel" };
    }

    let qualisCrosswalk = null;
    try {
      const { data, error } = await supabase.rpc("run_qualis_crosswalk");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      qualisCrosswalk = {
        updated: row?.updated_count ?? 0,
        unmatched: row?.unmatched_count ?? 0,
      };
    } catch {
      qualisCrosswalk = { skipped: true, reason: "Base Qualis ausente ou crosswalk indisponivel" };
    }

    return NextResponse.json({
      imported: validRows.length,
      summary,
      jcrCrosswalk,
      qualisCrosswalk,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao importar planilha de qualidade",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
