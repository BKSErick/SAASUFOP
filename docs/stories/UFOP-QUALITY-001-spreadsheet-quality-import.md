# UFOP-QUALITY-001 - Importacao de planilhas de curriculo para qualidade CAPES

## Status

In progress

## Contexto

As metricas de qualidade (QUALIS, h-index, FWCI, internacionalizacao e producao qualificada) nao devem depender de integracao automatica com Lattes. A fonte operacional sera a planilha de curriculo anexada por cada docente.

## Acceptance Criteria

- [x] Cada docente tem uma acao para subir planilha de curriculo em `.xlsx`, `.xls` ou `.csv`.
- [x] A API de importacao le a planilha, extrai publicacoes e grava em `producoes`.
- [x] A importacao captura `titulo`, `journal`, `issn`, `doi`, `qualis`, `jcr_quartile`, `link_scopus` e `data_publicacao` quando existirem.
- [x] A importacao atualiza contagem de producoes e data de ultima planilha no docente.
- [x] Existe base SQL para crosswalk QUALIS por ISSN ou nome do periodico.
- [x] Existe script local para auditar planilhas e apontar publicacoes sem QUALIS/JCR/ISSN/journal.
- [x] Telas de Qualidade e Producoes deixam de prometer sincronizacao Lattes/XML como fonte das metricas.

## File List

- `src/lib/quality-spreadsheet.ts`
- `src/app/api/quality/import/route.ts`
- `src/app/dashboard/docentes/DocentesView.tsx`
- `src/app/dashboard/qualidade/page.tsx`
- `src/app/dashboard/producoes/page.tsx`
- `scripts/verify-publication-quality.cjs`
- `supabase/migrations/20260702000000_add_quality_spreadsheet_crosswalk.sql`

## Notes

- O XML/Lattes ainda existe no codigo como rota separada, mas nao e mais apresentado como fonte das metricas de qualidade.
- O script roda localmente sem banco: `node scripts/verify-publication-quality.cjs --input caminho.xlsx --qualis qualis.xlsx --jcr jcr.xlsx --out report.json`.
- h-index/FWCI/internacionalizacao so podem ser consolidados se essas colunas vierem na planilha ou se houver base externa futura.
