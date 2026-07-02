-- Keepalive Supabase
-- Sem SMTP, sem service role, sem pg_net.
-- Rode a migration 20260508000001_add_cron_jubilamento.sql para agendar
-- apenas um SELECT diario via pg_cron, com objetivo de evitar pausa do projeto.

-- Verificar job ativo:
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'ufop-keepalive-diario';