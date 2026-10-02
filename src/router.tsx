import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },

    // GitHub Pages serves this project from:
    // https://immlad.github.io/link-anywhere-remote/
    //
    // Vite automatically sets BASE_URL to /link-anywhere-remote/
    // during the GitHub Pages build.
    basepath: import.meta.env.BASE_URL.replace(/\/$/, ""),

    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
