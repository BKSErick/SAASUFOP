-- Importacao de planilhas de curriculo e verificacao QUALIS.
-- A fonte operacional das metricas de qualidade passa a ser a planilha
-- anexada por docente, com QUALIS/JCR preenchidos diretamente ou cruzados
-- contra bases de referencia importadas.

ALTER TABLE producoes ADD COLUMN IF NOT EXISTS issn TEXT;
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS jcr_quartile TEXT;
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS doi TEXT;
ALTER TABLE producoes ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'ARTIGO';

CREATE UNIQUE INDEX IF NOT EXISTS idx_producoes_professor_titulo_unique
    ON producoes (professor_id, titulo);

CREATE TABLE IF NOT EXISTS journals_qualis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issn TEXT,
    journal_name TEXT NOT NULL,
    qualis TEXT NOT NULL CHECK (qualis IN ('A1','A2','A3','A4','B1','B2','B3','B4','C')),
    area TEXT,
    ref_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (issn, area, ref_year)
);

ALTER TABLE journals_qualis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users: journals_qualis"
    ON journals_qualis FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_journals_qualis_issn ON journals_qualis (issn);
CREATE INDEX IF NOT EXISTS idx_journals_qualis_name ON journals_qualis USING gin (to_tsvector('simple', journal_name));

CREATE OR REPLACE FUNCTION run_qualis_crosswalk()
RETURNS TABLE(updated_count INTEGER, unmatched_count INTEGER) AS $$
DECLARE
    v_updated INTEGER := 0;
    v_unmatched INTEGER := 0;
BEGIN
    WITH matched AS (
        UPDATE producoes p
        SET qualis = q.qualis
        FROM journals_qualis q
        WHERE p.qualis IS NULL
          AND p.issn IS NOT NULL
          AND p.issn != ''
          AND p.issn = q.issn
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated FROM matched;

    WITH matched_name AS (
        UPDATE producoes p
        SET qualis = q.qualis
        FROM journals_qualis q
        WHERE p.qualis IS NULL
          AND p.journal IS NOT NULL
          AND lower(trim(p.journal)) = lower(trim(q.journal_name))
        RETURNING p.id
    )
    SELECT v_updated + COUNT(*) INTO v_updated FROM matched_name;

    SELECT COUNT(*) INTO v_unmatched
    FROM producoes
    WHERE qualis IS NULL AND journal IS NOT NULL AND journal != '';

    RETURN QUERY SELECT v_updated, v_unmatched;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
