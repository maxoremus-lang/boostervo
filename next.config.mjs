/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/mockup.html" },
    ];
  },
};

export default nextConfig;
