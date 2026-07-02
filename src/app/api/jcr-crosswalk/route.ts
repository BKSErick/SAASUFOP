import { NextResponse } from 'next/server'
import { ADMIN_ROLES, requireApiAuth } from '@/lib/api-auth'
import { parseJCRcsv, importJournalList, runCrosswalk } from '@/lib/jcr-crosswalk'

// POST /api/jcr-crosswalk
// Body: { action: 'run' }                       â†’ sÃ³ executa o crosswalk
// Body: { action: 'import', csv: '<csv text>' } â†’ importa CSV e executa crosswalk
export async function POST(req: Request) {
    const auth = await requireApiAuth(req, { roles: ADMIN_ROLES })
    if (!auth.ok) return auth.response

    try {
        const body = await req.json()
        const { action, csv } = body as { action: 'run' | 'import'; csv?: string }

        let importResult: { imported: number; errors: string[] } | null = null

        if (action === 'import') {
            if (!csv || typeof csv !== 'string') {
                return NextResponse.json({ error: 'Campo csv obrigatorio para action=import' }, { status: 400 })
            }
            const journals = parseJCRcsv(csv)
            if (journals.length === 0) {
                return NextResponse.json({ error: 'Nenhum journal valido encontrado no CSV' }, { status: 422 })
            }
            importResult = await importJournalList(journals)
        }

        const crosswalk = await runCrosswalk()

        return NextResponse.json({
            ...(importResult ? { import: importResult } : {}),
            crosswalk,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// GET /api/jcr-crosswalk â†’ retorna stats atuais
export async function GET(request: Request) {
    const auth = await requireApiAuth(request, { roles: ADMIN_ROLES })
    if (!auth.ok) return auth.response

    try {
        const crosswalk = await runCrosswalk()
        return NextResponse.json({ crosswalk })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
