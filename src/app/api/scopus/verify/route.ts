import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findScopusPublication, hasScopusConfig } from "@/lib/scopus-client";

export const runtime = "nodejs";

type ProducaoLookup = {
  id: string;
  titulo: string;
  journal: string | null;
  doi: string | null;
  link_scopus: string | null;
};

export async function GET(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  const { count, error } = await supabaseAdmin
    .from("producoes")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: "Falha ao contar producoes", details: error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: hasScopusConfig(),
    totalProducoes: count ?? 0,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  if (!hasScopusConfig()) {
    return NextResponse.json(
      { error: "ELSEVIER_API_KEY nao configurada no ambiente do servidor" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({})) as { limit?: number; force?: boolean };
    const limit = Math.min(Math.max(Number(body.limit ?? 25), 1), 100);
    const force = Boolean(body.force);

    let query = supabaseAdmin
      .from("producoes")
      .select("id, titulo, journal, doi, link_scopus")
      .order("data_publicacao", { ascending: false });

    if (!force) query = query.or("link_scopus.is.null,link_scopus.eq.");

    const { data: producoes, error: selectError } = await query
      .limit(limit)
      .returns<ProducaoLookup[]>();
    if (selectError) throw selectError;

    let checked = 0;
    let matched = 0;
    let updated = 0;
    const unmatched: string[] = [];
    const errors: Array<{ id: string; title: string; message: string }> = [];

    for (const producao of producoes ?? []) {
      checked += 1;
      try {
        const result = await findScopusPublication({
          doi: producao.doi,
          title: producao.titulo,
          journal: producao.journal,
        });

        if (!result?.found) {
          unmatched.push(producao.titulo);
          continue;
        }

        matched += 1;
        const link = result.link ?? producao.link_scopus;

        if (link && link !== producao.link_scopus) {
          const { error: updateError } = await supabaseAdmin
            .from("producoes")
            .update({ link_scopus: link })
            .eq("id", producao.id);

          if (updateError) throw updateError;
          updated += 1;
        }
      } catch (error) {
        errors.push({
          id: producao.id,
          title: producao.titulo,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      checked,
      matched,
      updated,
      unmatched: unmatched.length,
      unmatchedSamples: unmatched.slice(0, 10),
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao verificar Scopus",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
