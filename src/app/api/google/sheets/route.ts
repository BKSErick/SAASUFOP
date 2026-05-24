import { NextResponse } from 'next/server'
import { getSpreadsheetData } from '@/lib/google-sheets'
import { logError } from '@/lib/logger'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

interface SheetMapping {
    sheetColumn: string
    supabaseField: string
    required: boolean
}

const ALUNOS_MAPPING: SheetMapping[] = [
    { sheetColumn: 'nome',          supabaseField: 'nome',          required: true },
    { sheetColumn: 'matricula',     supabaseField: 'matricula',     required: true },
    { sheetColumn: 'email',         supabaseField: 'email',         required: false },
    { sheetColumn: 'data_ingresso', supabaseField: 'data_ingresso', required: false },
]

const FIELD_KEYWORDS: Record<string, string[]> = {
    nome:           ['NOME', 'NAME', 'ALUNO', 'DISCENTE'],
    matricula:      ['MATRÍCULA', 'MATRICULA', 'MAT', 'REGISTRO'],
    email:          ['EMAIL', 'E-MAIL'],
    data_ingresso:  ['DATA INGRESSO', 'INGRESSO', 'ENTRADA', 'INÍCIO', 'INICIO'],
}

function findHeader(headers: string[], keywords: string[]): number {
    for (const kw of keywords) {
        const idx = headers.findIndex(h => h.toUpperCase().includes(kw.toUpperCase()))
        if (idx !== -1) return idx
    }
    return -1
}

function parseDate(val: string): string | null {
    if (!val) return null
    const match = val.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (match) return `${match[3]}-${match[2]}-${match[1]}`
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { spreadsheetId, range = process.env.GOOGLE_SHEETS_RANGE ?? 'A1:Z500' } = body

        if (!spreadsheetId) {
            return NextResponse.json({ error: 'spreadsheetId é obrigatório' }, { status: 400 })
        }

        const rawData = await getSpreadsheetData(spreadsheetId, range)
        if (!rawData || rawData.length < 2) {
            return NextResponse.json({ error: 'Planilha vazia ou sem linhas de dados' }, { status: 400 })
        }

        const [headerRow, ...dataRows] = rawData
        const headers = headerRow.map(h => String(h).trim())

        // Resolve column indexes via fuzzy header matching
        const colIdx: Record<string, number> = {}
        const mappingErrors: string[] = []
        for (const mapping of ALUNOS_MAPPING) {
            const keywords = FIELD_KEYWORDS[mapping.supabaseField] ?? [mapping.sheetColumn]
            const idx = findHeader(headers, keywords)
            if (idx === -1 && mapping.required) {
                mappingErrors.push(
                    `Coluna obrigatória não encontrada: "${mapping.sheetColumn}" (tentativas: ${keywords.join(', ')})`
                )
            }
            colIdx[mapping.supabaseField] = idx
        }

        if (mappingErrors.length > 0) {
            return NextResponse.json({ error: 'Erro de mapeamento de colunas', details: mappingErrors }, { status: 422 })
        }

        // Map rows to alunos records
        const rowErrors: { linha: number; mensagem: string }[] = []
        const valid: { nome: string; matricula: string; email: string | null; data_ingresso: string | null }[] = []

        dataRows.forEach((row, i) => {
            const linhaPlanilha = i + 2
            const nome      = colIdx.nome      !== -1 ? String(row[colIdx.nome]      ?? '').trim() : ''
            const matricula = colIdx.matricula  !== -1 ? String(row[colIdx.matricula] ?? '').trim() : ''

            if (!nome || !matricula) {
                if (row.some(c => c)) {
                    rowErrors.push({ linha: linhaPlanilha, mensagem: 'Nome ou matrícula ausente' })
                }
                return
            }

            const email = colIdx.email !== -1 && row[colIdx.email]
                ? String(row[colIdx.email]).trim() || null
                : null

            const rawDate = colIdx.data_ingresso !== -1 && row[colIdx.data_ingresso]
                ? String(row[colIdx.data_ingresso]).trim()
                : null
            const data_ingresso = rawDate ? parseDate(rawDate) : null

            valid.push({ nome, matricula, email, data_ingresso })
        })

        if (valid.length === 0) {
            return NextResponse.json({ read: dataRows.length, inserted: 0, updated: 0, errors: rowErrors })
        }

        // Pre-check existing to differentiate inserted vs updated
        const matriculas = valid.map(r => r.matricula)
        const { data: existing } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculas)
        const existingSet = new Set(existing?.map(r => r.matricula) ?? [])

        const { error: upsertError } = await supabase
            .from('alunos')
            .upsert(valid, { onConflict: 'matricula' })

        if (upsertError) {
            logError('sheets-api upsert', upsertError)
            return NextResponse.json(
                { error: 'Falha ao persistir dados no Supabase', details: upsertError.message },
                { status: 500 }
            )
        }

        const inserted = valid.filter(r => !existingSet.has(r.matricula)).length
        const updated  = valid.filter(r =>  existingSet.has(r.matricula)).length

        return NextResponse.json({ read: dataRows.length, inserted, updated, errors: rowErrors })
    } catch (error: any) {
        logError('sheets-api', error)
        return NextResponse.json(
            { error: 'Falha ao buscar dados da planilha', details: error.message },
            { status: 500 }
        )
    }
}
