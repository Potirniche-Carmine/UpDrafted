import path from "path";
import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

const repoRoot = path.resolve(process.cwd(), "../..");
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
