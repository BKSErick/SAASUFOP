import { NextResponse } from 'next/server'
import { ADMIN_ROLES, requireApiAuth } from '@/lib/api-auth'
import { parseLattesXML } from '@/lib/lattes-xml-parser'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logError } from '@/lib/logger'

const MAX_XML_BYTES = 12 * 1024 * 1024

function dateFromYear(year: string): string | null {
    const normalized = String(year ?? '').trim()
    if (!/^\d{4}$/.test(normalized)) return null
    return `${normalized}-01-01`
}

function cleanText(value: unknown): string | null {
    const text = String(value ?? '').trim()
    return text.length > 0 ? text : null
}

export async function POST(request: Request) {
    const auth = await requireApiAuth(request, { roles: ADMIN_ROLES })
    if (!auth.ok) return auth.response

    try {
        const form = await request.formData()
        const professorId = cleanText(form.get('professorId'))
        const file = form.get('file')

        if (!professorId) {
            return NextResponse.json({ error: 'professorId obrigatorio' }, { status: 400 })
        }

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Arquivo XML obrigatorio' }, { status: 400 })
        }

        if (file.size > MAX_XML_BYTES) {
            return NextResponse.json({ error: 'Arquivo XML excede 12 MB' }, { status: 413 })
        }

        const xml = await file.text()
        const parsed = await parseLattesXML(xml)

        const { data: professor, error: professorError } = await supabaseAdmin
            .from('professores')
            .select('id')
            .eq('id', professorId)
            .maybeSingle()

        if (professorError) throw professorError
        if (!professor) {
            return NextResponse.json({ error: 'Docente nao encontrado' }, { status: 404 })
        }

        await Promise.all([
            supabaseAdmin.from('producoes').delete().eq('professor_id', professorId),
            supabaseAdmin.from('conferencias').delete().eq('professor_id', professorId),
            supabaseAdmin.from('projetos').delete().eq('professor_id', professorId),
            supabaseAdmin.from('orientacoes').delete().eq('professor_id', professorId),
        ])

        const artigos = parsed.artigos
            .filter((a) => cleanText(a.titulo))
            .map((a) => ({
                professor_id: professorId,
                titulo: cleanText(a.titulo),
                journal: cleanText(a.periodico),
                data_publicacao: dateFromYear(a.ano),
                tipo: 'ARTIGO',
                doi: cleanText(a.doi),
                issn: cleanText(a.issn),
            }))

        const conferencias = parsed.conferencias
            .filter((c) => cleanText(c.titulo))
            .map((c) => ({
                professor_id: professorId,
                titulo: cleanText(c.titulo),
                ano: cleanText(c.ano),
                evento: cleanText(c.evento),
                cidade: cleanText(c.cidade),
                natureza: cleanText(c.natureza),
                classificacao: cleanText(c.classificacao),
            }))

        const projetos = parsed.projetos
            .filter((p) => cleanText(p.titulo))
            .map((p) => ({
                professor_id: professorId,
                titulo: cleanText(p.titulo),
                ano_inicio: cleanText(p.ano_inicio),
                ano_fim: cleanText(p.ano_fim),
                situacao: cleanText(p.situacao),
                financiador: cleanText(p.financiador),
            }))

        const orientacoes = parsed.orientacoes
            .filter((o) => cleanText(o.titulo) || cleanText(o.orientado))
            .map((o) => ({
                professor_id: professorId,
                tipo: cleanText(o.tipo),
                titulo: cleanText(o.titulo),
                ano: cleanText(o.ano),
                orientado: cleanText(o.orientado),
                situacao: cleanText(o.situacao),
                instituicao: cleanText(o.instituicao),
            }))

        const insertions = [
            artigos.length ? supabaseAdmin.from('producoes').insert(artigos) : Promise.resolve({ error: null }),
            conferencias.length ? supabaseAdmin.from('conferencias').insert(conferencias) : Promise.resolve({ error: null }),
            projetos.length ? supabaseAdmin.from('projetos').insert(projetos) : Promise.resolve({ error: null }),
            orientacoes.length ? supabaseAdmin.from('orientacoes').insert(orientacoes) : Promise.resolve({ error: null }),
        ]

        const results = await Promise.all(insertions)
        const insertError = results.find((result) => result.error)?.error
        if (insertError) throw insertError

        const today = new Date().toISOString().slice(0, 10)
        const { error: updateError } = await supabaseAdmin
            .from('professores')
            .update({
                producao_count: artigos.length,
                lattes_updated_at: today,
                ...(parsed.indexH != null ? { kpi_h: parsed.indexH } : {}),
            })
            .eq('id', professorId)

        if (updateError) throw updateError

        return NextResponse.json({
            professorId,
            imported: {
                artigos: artigos.length,
                conferencias: conferencias.length,
                projetos: projetos.length,
                orientacoes: orientacoes.length,
            },
            lattes_updated_at: today,
            notes: ['JCR/Qualis/Scopus dependem do crosswalk e bases externas.'],
        })
    } catch (error: any) {
        logError('lattes-import', error)
        return NextResponse.json(
            { error: 'Falha ao importar Curriculo Lattes', details: error.message },
            { status: 500 }
        )
    }
}