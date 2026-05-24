-- Migration: estende schema para o redesign (UFOP-MIG-001)
-- Aditiva e idempotente. Espelha os campos esperados em src/types/domain.ts.
-- Decisão de design: linhas_pesquisa.id SMALLINT (0-4) espelha o índice do
-- mock LINHAS[] → mapeamento estável mock↔DB e FK com integridade.

-- ── 1. Linhas de pesquisa ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS linhas_pesquisa (
    id SMALLINT PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE linhas_pesquisa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users: linhas_pesquisa" ON linhas_pesquisa;
CREATE POLICY "Authenticated users: linhas_pesquisa"
    ON linhas_pesquisa FOR ALL USING (auth.uid() IS NOT NULL);

INSERT INTO linhas_pesquisa (id, nome) VALUES
    (0, 'Bancos de Dados & IA'),
    (1, 'Engenharia de Software'),
    (2, 'Sistemas Distribuídos'),
    (3, 'Visão Computacional'),
    (4, 'Otimização & Teoria')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE linhas_pesquisa IS 'Linhas de pesquisa do PPGCC. id 0-4 espelha o índice do mock LINHAS[] para mapeamento estável (UFOP-MIG-001).';

-- ── 2. Disciplinas (tabela nova — existe no redesign, não havia no schema) ─
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    creditos INTEGER NOT NULL DEFAULT 4,
    professor_id UUID REFERENCES professores(id),
    periodo TEXT,
    matriculados INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users: disciplinas" ON disciplinas;
CREATE POLICY "Authenticated users: disciplinas"
    ON disciplinas FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 3. Professores — colunas aditivas ─────────────────────────────────────
ALTER TABLE professores ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS linha_pesquisa_id SMALLINT REFERENCES linhas_pesquisa(id);
ALTER TABLE professores ADD COLUMN IF NOT EXISTS orientandos_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS capes_rating TEXT;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS producao_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS lattes_updated_at DATE;

COMMENT ON COLUMN professores.kpi_h IS 'h-index (campo "h" no domain.ts).';
COMMENT ON COLUMN professores.capes_rating IS 'Conceito CAPES do docente: 1A | 1B | 2.';

-- ── 4. Alunos — colunas aditivas ──────────────────────────────────────────
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS nivel TEXT;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS creditos INTEGER NOT NULL DEFAULT 0;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS linha_pesquisa_id SMALLINT REFERENCES linhas_pesquisa(id);
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS producoes_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS avatar_hue INTEGER;

COMMENT ON COLUMN alunos.avatar_hue IS 'Matiz 0-360 para o avatar gerado na UI.';

-- ── 5. CHECK constraints (idempotentes via guarda) ────────────────────────
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_alunos_nivel') THEN
        ALTER TABLE alunos ADD CONSTRAINT chk_alunos_nivel CHECK (nivel IS NULL OR nivel IN ('Mestrado', 'Doutorado'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_alunos_avatar_hue') THEN
        ALTER TABLE alunos ADD CONSTRAINT chk_alunos_avatar_hue CHECK (avatar_hue IS NULL OR (avatar_hue BETWEEN 0 AND 360));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_prof_capes') THEN
        ALTER TABLE professores ADD CONSTRAINT chk_prof_capes CHECK (capes_rating IS NULL OR capes_rating IN ('1A', '1B', '2'));
    END IF;
END $$;

-- ── 6. Índices em FKs / colunas de filtro ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_professores_linha ON professores(linha_pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_alunos_linha ON alunos(linha_pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_alunos_orientador ON alunos(professor_orientador_id);
CREATE INDEX IF NOT EXISTS idx_alunos_prazo ON alunos(prazo_jubilamento);
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_producoes_professor ON producoes(professor_id);
CREATE INDEX IF NOT EXISTS idx_bancas_aluno ON bancas(aluno_id);
