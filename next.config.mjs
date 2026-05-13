/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow ALL HTTPS images (development only ⚠️)
      {
        protocol: "https",
        hostname: "**",
      },
      // Also allow HTTP if needed (not recommended)
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optional: Disable image optimization entirely (not recommended)
    // unoptimized: true,
  },
};

export default nextConfig;
