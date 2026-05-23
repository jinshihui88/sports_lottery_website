/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // 支持静态导出
  output: 'export',
  trailingSlash: true,
  // 基础路径配置
  basePath: '',
  // 资源前缀
  assetPrefix: '',
}

module.exports = nextConfig