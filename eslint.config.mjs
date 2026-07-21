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
    // Written by PocketBase itself, not by us:
    //   pb_migrations/ — committed; each migration opens with a triple-slash
    //     reference that the TypeScript ruleset rejects, and it is rewritten
    //     on every schema change anyway.
    //   pb_data/       — gitignored, so CI never saw it, but it holds a
    //     generated types.d.ts with 600+ violations that broke local runs.
    // Our own scripts under prototype/ are still linted.
    "prototype/portfolio-cms/pb_migrations/**",
    "prototype/portfolio-cms/pb_data/**",
  ]),
]);

export default eslintConfig;
