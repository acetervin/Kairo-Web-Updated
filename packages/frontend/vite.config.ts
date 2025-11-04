import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@boo-back/shared", replacement: path.resolve(__dirname, "../shared") },
      { find: "@shared", replacement: path.resolve(__dirname, "../shared") },
      { find: "@assets", replacement: path.resolve(__dirname, "../../attached_assets") },
    ],
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "../../dist/public"),
    emptyOutDir: true,
  },
});
