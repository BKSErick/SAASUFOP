import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildTransporter() {
    const host = process.env.SMTP_HOST
    if (!host) return null // modo dry-run: loga mas não envia

    return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
}

function templateAlerta(nome: string, meses: number, tipo: string): { subject: string; html: string } {
    const isJubilado = tipo === 'JUBILADO'

    const subject = isJubilado
        ? `[UFOP PPGEP] Prazo de conclusão atingido — ${nome}`
        : `[UFOP PPGEP] Alerta de jubilamento — ${nome}`

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">

    <div style="background: #9D2235; padding: 24px 32px;">
      <p style="color: #fff; margin: 0; font-size: 13px; opacity: 0.85;">Programa de Pós-Graduação em Engenharia de Produção</p>
      <h1 style="color: #fff; margin: 8px 0 0; font-size: 20px;">
        ${isJubilado ? '⚠️ Prazo de Conclusão Atingido' : '🔔 Alerta de Jubilamento'}
      </h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #333; font-size: 15px;">Prezado(a) <strong>${nome}</strong>,</p>

      ${isJubilado ? `
      <p style="color: #333; font-size: 14px; line-height: 1.6;">
        Identificamos que você completou <strong>${meses} meses</strong> de curso, atingindo o
        prazo máximo de <strong>30 meses</strong> do programa de mestrado.
      </p>
      <p style="color: #333; font-size: 14px; line-height: 1.6;">
        Entre em contato <strong>imediatamente</strong> com a coordenação do PPGEP para regularizar
        sua situação acadêmica.
      </p>
      ` : `
      <p style="color: #333; font-size: 14px; line-height: 1.6;">
        Identificamos que você completou <strong>${meses} meses</strong> de curso. O prazo máximo
        do programa de mestrado é de <strong>30 meses</strong>, portanto restam
        <strong>${30 - meses} meses</strong> para a defesa.
      </p>
      <p style="color: #333; font-size: 14px; line-height: 1.6;">
        Por favor, entre em contato com seu orientador e com a coordenação para alinhar
        o cronograma de defesa.
      </p>
      `}

      <div style="background: #f9f9f9; border-left: 4px solid #9D2235; padding: 16px; border-radius: 4px; margin-top: 24px;">
        <p style="margin: 0; color: #555; font-size: 13px;">
          <strong>Coordenação PPGEP — UFOP</strong><br />
          Este é um e-mail automático. Não responda a esta mensagem.
        </p>
      </div>
    </div>

  </div>
</body>
</html>`

    return { subject, html }
}

export async function POST() {
    const transporter = buildTransporter()
    const dryRun = !transporter

    // Busca alertas pendentes
    const { data: alertas, error } = await supabase
        .from('alertas_jubilamento')
        .select('*')
        .eq('email_enviado', false)
        .order('criado_em', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!alertas || alertas.length === 0) {
        return NextResponse.json({ enviados: 0, mensagem: 'Nenhum alerta pendente.' })
    }

    const from = process.env.SMTP_FROM ?? 'coordenacao.ppgep@ufop.edu.br'
    const resultados: any[] = []

    for (const alerta of alertas) {
        const { subject, html } = templateAlerta(alerta.aluno_nome, alerta.meses_cursados, alerta.tipo_alerta)
        const destinatarios = [alerta.aluno_email, alerta.orientador_email].filter(Boolean)

        if (dryRun) {
            console.log(`[DRY-RUN] Para: ${destinatarios.join(', ')} | ${subject}`)
        } else {
            try {
                await transporter!.sendMail({ from, to: destinatarios.join(', '), subject, html })
            } catch (e: any) {
                resultados.push({ id: alerta.id, erro: e.message })
                continue
            }
        }

        await supabase
            .from('alertas_jubilamento')
            .update({ email_enviado: true })
            .eq('id', alerta.id)

        resultados.push({
            id: alerta.id,
            aluno: alerta.aluno_nome,
            tipo: alerta.tipo_alerta,
            destinatarios,
            dry_run: dryRun,
        })
    }

    return NextResponse.json({ enviados: resultados.length, dry_run: dryRun, detalhes: resultados })
}
