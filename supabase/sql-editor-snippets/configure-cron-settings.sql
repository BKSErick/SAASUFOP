-- Rodar UMA VEZ no SQL Editor do Supabase após habilitar pg_cron e pg_net.
-- Substitua os valores abaixo com os dados reais do seu projeto.
-- Project URL e Service Role Key: Dashboard → Settings → API

ALTER DATABASE postgres
    SET "app.settings.supabase_url" = 'https://pmlvqbnypixmccjdttjw.supabase.co';

ALTER DATABASE postgres
    SET "app.settings.service_role_key" = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHZxYm55cGl4bWNjamR0dGp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUyNDE1MCwiZXhwIjoyMDkyMTAwMTUwfQ.bmg3AKH7EIsssmOJlmRbx7YMmhtrb6JhasDlOny02AU';

-- Após rodar o ALTER DATABASE, rode a migration normalmente:
-- supabase db push  (ou cole o conteúdo de 20260508000001_add_cron_jubilamento.sql)
