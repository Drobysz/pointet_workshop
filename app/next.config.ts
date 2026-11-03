import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },

  images: {
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      {
          protocol: "https",
          hostname: "pointet-workshop-s3.s3.eu-west-3.amazonaws.com",
      },
    ],
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  }, 
};

export default withNextIntl(nextConfig);
