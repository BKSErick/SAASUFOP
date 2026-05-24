-- Migration: missing tables, column fixes, proper RLS
-- Covers: UFOP-BUG-001, UFOP-SEC-001, UFOP-FEAT-001, UFOP-FEAT-002, UFOP-FEAT-003

-- ── BUG-001: alunos table fixes ──────────────────────────────────────────────
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ATIVO';

-- ── FEAT fixes: producoes needs tipo + doi (Lattes import uses them) ─────────
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'ARTIGO';
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS doi TEXT;

-- ── FEAT-001: Conferências ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
    titulo TEXT,
    ano TEXT,
    evento TEXT,
    cidade TEXT,
    natureza TEXT,
    classificacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conferencias ENABLE ROW LEVEL SECURITY;

-- ── FEAT-002: Projetos de Pesquisa ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
    titulo TEXT,
    ano_inicio TEXT,
    ano_fim TEXT,
    situacao TEXT,
    financiador TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- ── FEAT-003: Orientações ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orientacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
    tipo TEXT,
    titulo TEXT,
    ano TEXT,
    orientado TEXT,
    situacao TEXT,
    instituicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orientacoes ENABLE ROW LEVEL SECURITY;

-- ── SEC-001: Replace permissive USING(true) with auth-based policies ─────────
DROP POLICY IF EXISTS "Enable full access for professores" ON professores;
DROP POLICY IF EXISTS "Enable full access for alunos" ON alunos;
DROP POLICY IF EXISTS "Enable full access for producoes" ON producoes;
DROP POLICY IF EXISTS "Enable full access for bancas" ON bancas;

CREATE POLICY "Authenticated users: professores"
    ON professores FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: alunos"
    ON alunos FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: producoes"
    ON producoes FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: bancas"
    ON bancas FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: conferencias"
    ON conferencias FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: projetos"
    ON projetos FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users: orientacoes"
    ON orientacoes FOR ALL USING (auth.uid() IS NOT NULL);
