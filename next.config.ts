import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["dxf", "better-sqlite3"],
};

export default nextConfig;
