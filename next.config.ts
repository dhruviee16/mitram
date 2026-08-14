import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.unsplash.com" },
];

if (process.env.R2_PUBLIC_URL) {
  remotePatterns.push({ protocol: "https", hostname: new URL(process.env.R2_PUBLIC_URL).hostname });
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
