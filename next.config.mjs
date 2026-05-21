/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optional: Disable image optimization entirely (not recommended)
    // unoptimized: true,
  },
};

export default nextConfig;
