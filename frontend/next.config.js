/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // IMPORTANT:
    // Do NOT proxy /api/* in production. Vercel blocks private hostnames (e.g. localhost),
    // and this would break our Next.js route handlers under /app/api.
    if (process.env.NODE_ENV !== 'development') return [];

    // Local dev convenience only (optional).
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
