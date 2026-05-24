import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/professores", destination: "/dashboard/docentes", permanent: true },
      { source: "/dashboard/professores", destination: "/dashboard/docentes", permanent: true },
    ];
  },
};

export default nextConfig;
