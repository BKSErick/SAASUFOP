# UFOP-SEC-001 - API hardening inicial

## Status
Ready for Review

## Story
Como coordenacao do PPGEP/UFOP, quero que endpoints sensiveis do SaaS exijam sessao e permissao adequada, para que importacoes, alertas e operacoes administrativas nao fiquem expostas publicamente.

## Acceptance Criteria
- [x] Rotas API administrativas exigem usuario autenticado com role `admin`, `coordenacao` ou `secretaria`.
- [x] Rotas API de uso geral exigem sessao autenticada.
- [x] Job/automacao de alertas aceita segredo interno server-side sem expor service role em codigo versionado.
- [x] Service role JWT hardcoded e removido dos SQLs versionados.
- [x] Quality gates minimos rodam: lint, typecheck, test/build quando aplicavel.

## Tasks / Subtasks
- [x] Criar helper server-only de autorizacao para Route Handlers.
- [x] Aplicar autorizacao em `/api/chat`, `/api/google/drive`, `/api/google/sheets`, `/api/jcr-crosswalk` e `/api/send-jubilamento-alerts`.
- [x] Remover JWT service role hardcoded de migrations/snippets de cron.
- [x] Ajustar scripts de lint/test para gates executaveis.
- [x] Rodar validacoes e registrar resultado.

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS com 27 warnings preexistentes/permitidos por config.
- `npm.cmd test` - PASS (`npm run typecheck`).
- `npm.cmd run build` - PASS com rede liberada para `next/font/google`.
- `npm.cmd run build` sem rede - FAIL esperado por fetch de Google Fonts antes da compilacao app.

### Completion Notes List
- Criado helper `requireApiAuth` server-only para validar sessao Supabase, perfil em `perfis` e roles administrativas.
- `ADMIN_ROLES` aceita `admin`, `coordenacao` e `secretaria` para compatibilizar SQL atual e docs do Obsidian.
- Rotas administrativas agora retornam 401/403 antes de executar service role, upsert, imports, crosswalk ou envio de alertas.
- Atualizacao posterior: `/api/send-jubilamento-alerts` foi desativada em `UFOP-SCOPE-001`; SMTP saiu do escopo e cron virou apenas keepalive.
- JWT service role hardcoded removido dos SQLs versionados; snippet agora usa placeholder e migration usa `current_setting`.
- `lint` deixou de usar `next lint` e passou a executar `eslint src`; `test` agora existe como gate minimo de typecheck.

### File List
- `docs/stories/UFOP-SEC-001-api-hardening.md`
- `package.json`
- `src/lib/api-auth.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/google/drive/route.ts`
- `src/app/api/google/sheets/route.ts`
- `src/app/api/jcr-crosswalk/route.ts`
- `src/app/api/send-jubilamento-alerts/route.ts`
- `supabase/migrations/20260508000001_add_cron_jubilamento.sql`
- `supabase/sql-editor-snippets/configure-cron-settings.sql`

### Change Log
- 2026-07-02: Hardening inicial de APIs, saneamento de segredo versionado e gates minimos corrigidos.