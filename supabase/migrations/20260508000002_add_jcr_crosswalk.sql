-- Migration: JCR/Scopus crosswalk
-- Adiciona ISSN e jcr_quartile em producoes + tabela journals_jcr

-- ── producoes: novos campos ───────────────────────────────────────────────────
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS issn TEXT;
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS jcr_quartile TEXT; -- Q1 | Q2 | Q3 | Q4

-- ── journals_jcr: tabela de referência ───────────────────────────────────────
-- Importada via CSV (Dashboard ou API route /api/jcr-crosswalk POST)
CREATE TABLE IF NOT EXISTS journals_jcr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issn TEXT,
    issn_e TEXT,           -- e-ISSN (alternativo)
    journal_name TEXT NOT NULL,
    jcr_quartile TEXT NOT NULL CHECK (jcr_quartile IN ('Q1','Q2','Q3','Q4')),
    impact_factor DECIMAL(8,4),
    ref_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (issn, ref_year),
    UNIQUE (issn_e, ref_year)
);

ALTER TABLE journals_jcr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users: journals_jcr"
    ON journals_jcr FOR ALL USING (auth.uid() IS NOT NULL);

-- Índices para fuzzy match eficiente
CREATE INDEX IF NOT EXISTS idx_journals_jcr_issn     ON journals_jcr (issn);
CREATE INDEX IF NOT EXISTS idx_journals_jcr_issn_e   ON journals_jcr (issn_e);
CREATE INDEX IF NOT EXISTS idx_journals_jcr_name      ON journals_jcr USING gin (to_tsvector('simple', journal_name));

-- ── Função SQL: crosswalk em batch ────────────────────────────────────────────
-- Atualiza jcr_quartile em producoes fazendo join por ISSN (exato) ou nome (normalizado)
CREATE OR REPLACE FUNCTION run_jcr_crosswalk()
RETURNS TABLE(updated_count INTEGER, unmatched_count INTEGER) AS $$
DECLARE
    v_updated INTEGER := 0;
    v_unmatched INTEGER := 0;
BEGIN
    -- Match por ISSN exato
    WITH matched AS (
        UPDATE producoes p
        SET jcr_quartile = j.jcr_quartile
        FROM journals_jcr j
        WHERE (
            (p.issn IS NOT NULL AND p.issn != '' AND p.issn = j.issn) OR
            (p.issn IS NOT NULL AND p.issn != '' AND p.issn = j.issn_e)
        )
        AND p.jcr_quartile IS DISTINCT FROM j.jcr_quartile
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated FROM matched;

    -- Match por nome normalizado (sem ISSN)
    WITH matched_name AS (
        UPDATE producoes p
        SET jcr_quartile = j.jcr_quartile
        FROM journals_jcr j
        WHERE p.jcr_quartile IS NULL
          AND p.journal IS NOT NULL
          AND lower(trim(p.journal)) = lower(trim(j.journal_name))
        RETURNING p.id
    )
    SELECT v_updated + COUNT(*) INTO v_updated FROM matched_name;

    -- Conta não mapeados
    SELECT COUNT(*) INTO v_unmatched
    FROM producoes
    WHERE jcr_quartile IS NULL AND journal IS NOT NULL AND journal != '';

    RETURN QUERY SELECT v_updated, v_unmatched;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
