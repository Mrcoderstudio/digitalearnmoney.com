import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react-icons", "date-fns", "lucide-react"],
  },
  // ✅ Optional: Disable Turbopack on Vercel if needed
  // swcMinify: true,
};

export default nextConfig;