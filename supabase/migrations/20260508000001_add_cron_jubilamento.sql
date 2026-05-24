-- Migration: pg_cron para check-jubilamento diário

-- Habilita as extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove job anterior se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-jubilamento-diario') THEN
        PERFORM cron.unschedule('check-jubilamento-diario');
    END IF;
END $$;

-- Agenda: todo dia às 10:00 UTC (07:00 BRT)
SELECT cron.schedule(
    'check-jubilamento-diario',
    '0 10 * * *',
    $$
    SELECT net.http_post(
        url := 'https://pmlvqbnypixmccjdttjw.supabase.co/functions/v1/check-jubilamento',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHZxYm55cGl4bWNjamR0dGp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUyNDE1MCwiZXhwIjoyMDkyMTAwMTUwfQ.bmg3AKH7EIsssmOJlmRbx7YMmhtrb6JhasDlOny02AU'
        ),
        body := '{}'::jsonb
    );
    $$
);
