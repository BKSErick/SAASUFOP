import { NextResponse } from 'next/server'
import { ADMIN_ROLES, requireApiAuth } from '@/lib/api-auth'
import { listGoogleSheets } from '@/lib/google-sheets'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const auth = await requireApiAuth(request, { roles: ADMIN_ROLES })
    if (!auth.ok) return auth.response

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
