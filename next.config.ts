import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "pixabay.com" },
      // NOTE: Unsplash disabled — uncomment when re-enabling.
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;