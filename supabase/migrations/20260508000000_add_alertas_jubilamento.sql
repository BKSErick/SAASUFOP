-- Migration: tabela de log de alertas de jubilamento
-- Registra cada vez que o check-jubilamento altera o status de um aluno

CREATE TABLE IF NOT EXISTS alertas_jubilamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    aluno_nome TEXT,
    aluno_email TEXT,
    orientador_nome TEXT,
    orientador_email TEXT,
    meses_cursados INTEGER NOT NULL,
    tipo_alerta TEXT NOT NULL, -- 'ALERTA_JUBILAMENTO' | 'JUBILADO'
    status_anterior TEXT,
    email_enviado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE alertas_jubilamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users: alertas_jubilamento"
    ON alertas_jubilamento FOR ALL USING (auth.uid() IS NOT NULL);

-- Índice para consultas por aluno e data
CREATE INDEX IF NOT EXISTS idx_alertas_jubilamento_aluno
    ON alertas_jubilamento (aluno_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_jubilamento_tipo
    ON alertas_jubilamento (tipo_alerta, criado_em DESC);
