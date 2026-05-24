// Edge Function: check-jubilamento
// Roda diariamente via pg_cron às 10:00 UTC (07:00 BRT)
// Atualiza status dos alunos e registra alertas na tabela alertas_jubilamento

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MESES_ALERTA = 27
const MESES_JUBILAMENTO = 30

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calcularMeses(dataIngresso: string): number {
    const ingresso = new Date(dataIngresso)
    const hoje = new Date()
    return (
        (hoje.getFullYear() - ingresso.getFullYear()) * 12 +
        (hoje.getMonth() - ingresso.getMonth())
    )
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Busca alunos que ainda podem ser afetados (exclui titulados e desligados)
    const { data: alunos, error } = await supabase
        .from('alunos')
        .select(`
            id, nome, email, data_ingresso, status,
            professores:professor_orientador_id (nome, email)
        `)
        .not('data_ingresso', 'is', null)
        .not('status', 'in', '("TITULADO","DESLIGADO")')

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const resultado = {
        processados: alunos?.length ?? 0,
        atualizados: [] as any[],
        sem_alteracao: 0,
        erros: [] as string[],
    }

    for (const aluno of alunos ?? []) {
        const meses = calcularMeses(aluno.data_ingresso)

        let novoStatus: string | null = null
        if (meses >= MESES_JUBILAMENTO) {
            novoStatus = 'JUBILADO'
        } else if (meses >= MESES_ALERTA) {
            novoStatus = 'ALERTA_JUBILAMENTO'
        }

        // Só atualiza se o status mudou
        if (!novoStatus || aluno.status === novoStatus) {
            resultado.sem_alteracao++
            continue
        }

        const { error: updateError } = await supabase
            .from('alunos')
            .update({ status: novoStatus })
            .eq('id', aluno.id)

        if (updateError) {
            resultado.erros.push(`${aluno.nome}: ${updateError.message}`)
            continue
        }

        // Registra o alerta no log
        await supabase.from('alertas_jubilamento').insert({
            aluno_id: aluno.id,
            aluno_nome: aluno.nome,
            aluno_email: aluno.email,
            orientador_nome: (aluno.professores as any)?.nome ?? null,
            orientador_email: (aluno.professores as any)?.email ?? null,
            meses_cursados: meses,
            tipo_alerta: novoStatus,
            status_anterior: aluno.status,
        })

        resultado.atualizados.push({
            id: aluno.id,
            nome: aluno.nome,
            meses,
            status_anterior: aluno.status,
            novo_status: novoStatus,
        })
    }

    return new Response(JSON.stringify(resultado), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
})
