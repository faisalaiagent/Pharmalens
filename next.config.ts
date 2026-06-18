import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limit the number of concurrent static page generation workers during
  // `next build`. By default Next.js spawns one worker per CPU core — on
  // Vercel's build machines that can be 4–8 workers, each opening their own
  // Prisma connection pool. With a small hosted DB (pool limit 3–5) this
  // causes P2024 "connection pool timeout" errors. Setting this to 1 makes
  // the build sequential, which is the safest option when you can't raise
  // your DB's connection limit.
  experimental: {
    // `cpus` controls the maximum number of concurrent build workers.
    // Adjust up (e.g. 2 or 4) once you've upgraded your DB plan to allow
    // more concurrent connections.
    cpus: 1,
  },
};

export default nextConfig;
