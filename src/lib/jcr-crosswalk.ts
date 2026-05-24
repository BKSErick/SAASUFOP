// JCR/Scopus Crosswalk
// Importa lista de journals com quartil e faz match contra producoes

import { createClient } from '@supabase/supabase-js'

const getServiceClient = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

export interface JournalJCR {
    issn?: string
    issn_e?: string
    journal_name: string
    jcr_quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    impact_factor?: number
    ref_year?: number
}

export interface CrosswalkResult {
    updated: number
    unmatched: number
}

// Normaliza ISSN: remove hifens e espaços, uppercase
function normalizeISSN(issn: string): string {
    return issn.replace(/[-\s]/g, '').toUpperCase()
}

// Importa lista de journals para journals_jcr (upsert por ISSN + ano)
export async function importJournalList(journals: JournalJCR[]): Promise<{ imported: number; errors: string[] }> {
    const supabase = getServiceClient()
    const errors: string[] = []
    let imported = 0

    const rows = journals.map(j => ({
        issn: j.issn ? normalizeISSN(j.issn) : null,
        issn_e: j.issn_e ? normalizeISSN(j.issn_e) : null,
        journal_name: j.journal_name.trim(),
        jcr_quartile: j.jcr_quartile,
        impact_factor: j.impact_factor ?? null,
        ref_year: j.ref_year ?? new Date().getFullYear(),
    }))

    // Upsert em lotes de 500
    for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500)
        const { error } = await supabase
            .from('journals_jcr')
            .upsert(batch, { onConflict: 'issn,ref_year', ignoreDuplicates: false })

        if (error) {
            errors.push(`Lote ${i / 500 + 1}: ${error.message}`)
        } else {
            imported += batch.length
        }
    }

    return { imported, errors }
}

// Parseia CSV no formato JCR Export:
// Journal name, ISSN, eISSN, JIF Quartile, JIF, ...
export function parseJCRcsv(csvText: string): JournalJCR[] {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) return []

    const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())

    const col = (keys: string[]) => {
        for (const k of keys) {
            const idx = header.findIndex(h => h.includes(k))
            if (idx !== -1) return idx
        }
        return -1
    }

    const iName     = col(['journal name', 'full journal title', 'journal'])
    const iISSN     = col(['issn'])
    const iEISSN    = col(['eissn', 'e-issn'])
    const iQuartile = col(['quartile', 'jif quartile'])
    const iIF       = col(['impact factor', 'jif'])

    const quartileMap: Record<string, 'Q1'|'Q2'|'Q3'|'Q4'> = {
        q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4',
        '1': 'Q1', '2': 'Q2', '3': 'Q3', '4': 'Q4',
    }

    const result: JournalJCR[] = []

    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
        const name = iName !== -1 ? cells[iName] : ''
        const quartileRaw = iQuartile !== -1 ? cells[iQuartile].toLowerCase().replace('q', '') : ''
        const quartile = quartileMap[`q${quartileRaw}`] ?? quartileMap[quartileRaw]

        if (!name || !quartile) continue

        result.push({
            journal_name: name,
            issn: iISSN !== -1 ? cells[iISSN] : undefined,
            issn_e: iEISSN !== -1 ? cells[iEISSN] : undefined,
            jcr_quartile: quartile,
            impact_factor: iIF !== -1 ? parseFloat(cells[iIF]) || undefined : undefined,
        })
    }

    return result
}

// Executa o crosswalk via função SQL
export async function runCrosswalk(): Promise<CrosswalkResult> {
    const supabase = getServiceClient()
    const { data, error } = await supabase.rpc('run_jcr_crosswalk')
    if (error) throw new Error(error.message)
    const row = Array.isArray(data) ? data[0] : data
    return { updated: row?.updated_count ?? 0, unmatched: row?.unmatched_count ?? 0 }
}
