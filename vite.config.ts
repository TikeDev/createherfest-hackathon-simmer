import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Simmer",
        short_name: "Simmer",
        description: "Accessible recipe recommendations for your current abilities",
        theme_color: "#1a2420",
        background_color: "#1a2420",
        icons: [
          { src: "/simmer-logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "/simmer-logo-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  server: {
    port: parseInt(process.env.PORT || "5173", 10),
    strictPort: true,
    // The Python scraper (api/scrape-recipe.py) runs under a separate
    // `vercel dev` on 5174. Proxying keeps it same-origin so fetcher.ts can
    // keep calling the relative /api path and HMR still works here.
    proxy: {
      "/api": "http://localhost:5174",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
