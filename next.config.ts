
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  output: "export", // 👈 Required for static export
  basePath: "/taskpilot", // 👈 Replace with your repo name
  assetPrefix: "/taskpilot/", // 👈 Same here
  trailingSlash: true,
};

export default nextConfig;
