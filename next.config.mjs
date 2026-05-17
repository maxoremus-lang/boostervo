/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/mockup.html" },
    ];
  },
  async redirects() {
    return [
      // Renommage 2026-05-17 : Programme Fondateur -> Programme Gold.
      // 301 pour preserver les liens externes / SEO de l'ancienne URL.
      { source: "/programme-fondateur.html", destination: "/programme-gold.html", permanent: true },
    ];
  },
};

export default nextConfig;
