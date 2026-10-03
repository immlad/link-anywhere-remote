import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const base = process.env.GH_PAGES_BASE || "/";

export default defineConfig({
  base,

  plugins: [
    tsConfigPaths(),
    tailwindcss(),

    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),

    react(),
  ],

  build: {
    outDir: "dist-ghpages",
    emptyOutDir: true,

    rollupOptions: {
      input: "ghpages.html",
    },
  },
});