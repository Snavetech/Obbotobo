import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
  },
  build: {
    target: "es2020",
    sourcemap: true,
    chunkSizeWarningLimit: 520,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/gsap")) return "motion";
          if (id.includes("node_modules/lucide")) return "icons";
          return undefined;
        },
      },
    },
  },
});
