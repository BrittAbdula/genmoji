/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "store.genmojionline.com" }],
  },
  output: 'export',
};

export default nextConfig;
