import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Plain Vite + React + the "@" alias. No file-API middleware, no test runner —
// this is a mock-data front-end MVP. Dev/preview run on 5174 so the AIOS console
// (8080) and this app can run at the same time.
export default defineConfig({
  server: { host: "127.0.0.1", port: 5174 },
  preview: { host: "127.0.0.1", port: 5174 },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: { sourcemap: true },
});
