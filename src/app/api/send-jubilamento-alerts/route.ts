import { NextResponse } from 'next/server'
import { ADMIN_ROLES, requireApiAuth } from '@/lib/api-auth'

export async function POST(request: Request) {
    const auth = await requireApiAuth(request, { roles: ADMIN_ROLES })
    if (!auth.ok) return auth.response

    return NextResponse.json(
        {
            error: 'Envio automatico de e-mails desativado.',
            reason: 'SMTP institucional UFOP nao sera usado neste projeto.',
        },
        { status: 410 }
    )
}