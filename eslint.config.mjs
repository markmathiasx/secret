import nextConfig from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/coverage/**",
      "**/tmp/**",
      "**/reports/**",
      "**/data/**",
      "**/output/**",
      "**/public/**",
      "**/assets/**",
      "**/catalog-assets/**",
      "**/uploads/**",
      "**/welcome-to-docker/**",
      "**/multi-container-app/**",
    ],
  },
  ...nextConfig,
];
