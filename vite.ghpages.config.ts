// Static build config for GitHub Pages.
// Produces a pure client-side bundle in dist-ghpages/ — no server, no SSR.
// The Lovable preview/build keeps using vite.config.ts; this file is only
// used by `bun run build:ghpages` (and the GitHub Actions workflow).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// For a project page (username.github.io/REPO), set GH_PAGES_BASE=/REPO/.
// For a user/organization page (username.github.io), leave it as "/".
const base = process.env.GH_PAGES_BASE || "/";

export default defineConfig({
  base,
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  build: {
    outDir: "dist-ghpages",
    emptyOutDir: true,
  },
});
