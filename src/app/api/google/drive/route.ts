import { NextResponse } from 'next/server'
import { listGoogleSheets } from '@/lib/google-sheets'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const files = await listGoogleSheets()
        return NextResponse.json({ files })
    } catch (error: any) {
        logError('drive-api', error)
        return NextResponse.json(
            { error: 'Falha ao buscar arquivos do Drive', details: error.message },
            { status: 500 }
        )
    }
}
