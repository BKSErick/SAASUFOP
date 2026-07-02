# UFOP-BUG-001 - Encoding, importacao de curriculo e auditoria de dados reais

## Status

Done

## Contexto

Validacao visual encontrou textos quebrados por encoding, upload de curriculo sem efeito visivel, duvida sobre mock vs banco real e pagina de disciplinas vazia.

## Acceptance Criteria

- [x] Textos visiveis das telas principais do dashboard nao exibem mojibake.
- [x] Upload por docente aceita XML Lattes e planilha de curriculo.
- [x] Importacao XML/planilha exige sessao, sem depender de perfil administrativo em `perfis`.
- [x] XML Lattes ISO-8859-1 e decodificado corretamente.
- [x] Tela de Docentes mostra grafico de carga de orientacao.
- [x] Tela de Disciplinas informa que a tabela real esta vazia, sem fingir dados mock.
- [x] Banco real auditado: 17 docentes, 89 alunos, 0 producoes, 0 disciplinas, 0 bancas, June sem importacao persistida.

## File List

- `src/lib/api-auth.ts`
- `src/app/api/lattes/import/route.ts`
- `src/app/api/quality/import/route.ts`
- `src/app/dashboard/DashboardView.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/docentes/DocentesView.tsx`
- `src/app/dashboard/disciplinas/page.tsx`
- `src/app/dashboard/bancas/page.tsx`
- `src/app/dashboard/integracoes/page.tsx`
- `src/app/dashboard/relatorios/page.tsx`
- `src/app/dashboard/alunos/AlunosView.tsx`
- `src/app/api/chat/route.ts`
- `src/components/layout/Topbar.tsx`
- `src/types/domain.ts`
- `src/lib/data/index.ts`
- `src/lib/data/mock.ts`
