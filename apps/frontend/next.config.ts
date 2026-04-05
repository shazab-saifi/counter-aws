import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/signin",
        destination: "http://localhost:4000/signin",
      },
    ];
  },
};

export default nextConfig;
