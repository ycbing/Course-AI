import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: "/root/.openclaw/workspace/projects/course-ai",
  output: "standalone",
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
