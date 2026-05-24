-- Add RLS policies to allow full access for now (MVP stage)
CREATE POLICY "Enable full access for professores" ON "public"."professores"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable full access for alunos" ON "public"."alunos"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable full access for producoes" ON "public"."producoes"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable full access for bancas" ON "public"."bancas"
FOR ALL USING (true) WITH CHECK (true);
