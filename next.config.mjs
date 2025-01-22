/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "store.genmojionline.com" }],
  },
  output: 'standalone',
};

export default nextConfig;
