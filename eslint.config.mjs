import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_prototype/**",
  ]),
  // Backend portado verbatim do projeto antigo (apps/ufop-sas).
  // Relaxa no-explicit-any para warn nesses arquivos de parsing/import
  // (XML Lattes, xlsx SRA, JCR, Google). Débito técnico: tipar no
  // religamento Supabase (ver UFOP-MIG-001). Código NOVO segue strict.
  {
    files: [
      "src/lib/capes-logic.ts",
      "src/lib/lattes-xml-parser.ts",
      "src/lib/sra-import.ts",
      "src/lib/jcr-crosswalk.ts",
      "src/lib/google-sheets.ts",
      "src/lib/logger.ts",
      "src/app/api/**/*.ts",
      "src/app/login/page.tsx",
      "src/app/auth/**/*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
