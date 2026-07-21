/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // This creates static files in 'out' folder
  images: {
    unoptimized: true, // Required for static export
  },
  reactStrictMode: true,
}

module.exports = nextConfig