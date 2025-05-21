
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true, // Required for static exports with next/image
  },
  // It's generally better to fix TypeScript and ESLint errors rather than ignore them.
  // If these were causing the 404s by leading to broken pages,
  // the build will now fail until they are resolved.
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;
