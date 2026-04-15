import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
