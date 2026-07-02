-- Migration: pg_cron keepalive para evitar pausa do projeto Supabase.
-- Nao executa regras de negocio, nao envia e-mail e nao chama Edge Functions.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-jubilamento-diario') THEN
        PERFORM cron.unschedule('check-jubilamento-diario');
    END IF;

    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ufop-keepalive-diario') THEN
        PERFORM cron.unschedule('ufop-keepalive-diario');
    END IF;
END $$;

SELECT cron.schedule(
    'ufop-keepalive-diario',
    '0 10 * * *',
    $$
    SELECT now() AS keepalive_at;
    $$
);