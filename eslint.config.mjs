import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "apps/*/.next/**",
      "out/**",
      "public/sw.js",
      "public/workbox-*.js",
      "public/generate-icons.js",
      "apps/web/public/sw.js",
      "apps/web/public/workbox-*.js",
      "apps/web/public/generate-icons.js",
      "packages/db/drizzle/**",
    ],
  },
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
    settings: {
      next: {
        rootDir: ["apps/web/", "apps/admin/"],
      },
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
];

export default eslintConfig;
