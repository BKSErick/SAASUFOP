import { NextResponse } from 'next/server'
import { parseJCRcsv, importJournalList, runCrosswalk } from '@/lib/jcr-crosswalk'

// POST /api/jcr-crosswalk
// Body: { action: 'run' }                       → só executa o crosswalk
// Body: { action: 'import', csv: '<csv text>' } → importa CSV e executa crosswalk
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, csv } = body as { action: 'run' | 'import'; csv?: string }

        let importResult: { imported: number; errors: string[] } | null = null

        if (action === 'import') {
            if (!csv || typeof csv !== 'string') {
                return NextResponse.json({ error: 'Campo csv é obrigatório para action=import' }, { status: 400 })
            }
            const journals = parseJCRcsv(csv)
            if (journals.length === 0) {
                return NextResponse.json({ error: 'Nenhum journal válido encontrado no CSV' }, { status: 422 })
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

// GET /api/jcr-crosswalk → retorna stats atuais
export async function GET() {
    try {
        const crosswalk = await runCrosswalk()
        return NextResponse.json({ crosswalk })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
