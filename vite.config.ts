import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "app.webmanifest",
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: "module",
      },
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "placeholder.svg",
        "apple-touch-icon-app.png",
        "app-icon-72.png",
        "app-icon-96.png",
        "app-icon-128.png",
        "app-icon-144.png",
        "app-icon-152.png",
        "app-icon-192.png",
        "app-icon-256.png",
        "app-icon-384.png",
        "app-icon-512.png",
        "app-icon-1024.png"
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: "Creative Digital Labs",
        short_name: "DigitalLabs",
        id: "/",
        description: "An interactive STEM education platform with labs, games, creative tools, and learning modules.",
        theme_color: "#0a0a0f",
        background_color: "#0a0a0f",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "any",
        start_url: "/",
        scope: "/",
        categories: ["education", "productivity"],
        icons: [
          { src: "/app-icon-72.png", sizes: "72x72", type: "image/png", purpose: "any" },
          { src: "/app-icon-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
          { src: "/app-icon-128.png", sizes: "128x128", type: "image/png", purpose: "any" },
          { src: "/app-icon-144.png", sizes: "144x144", type: "image/png", purpose: "any" },
          { src: "/app-icon-152.png", sizes: "152x152", type: "image/png", purpose: "any" },
          { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/app-icon-256.png", sizes: "256x256", type: "image/png", purpose: "any" },
          { src: "/app-icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
          { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/apple-touch-icon-app.png", sizes: "180x180", type: "image/png", purpose: "any" },
          { src: "/app-icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
