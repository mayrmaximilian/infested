import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    domains: supabaseHostname ? [supabaseHostname, "images.unsplash.com"] : ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname || "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
