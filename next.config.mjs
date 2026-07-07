const remotePatterns = [
  {
    protocol: 'https',
    hostname: '**',
  },
];

try {
  const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
  if (storeUrl) {
    const { protocol, hostname, port } = new URL(storeUrl);
    remotePatterns.push({
      protocol: protocol.replace(':', ''),
      hostname,
      ...(port ? { port } : {}),
    });
  }
} catch {
  // Runtime environment validation reports an actionable URL error.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
