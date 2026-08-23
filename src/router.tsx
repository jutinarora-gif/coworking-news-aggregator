import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Routes that populate the QueryClient cache during SSR (via
  // context.queryClient.ensureQueryData) left the router trying to
  // dehydrate that live client as part of its own state - the client
  // carries internal functions, which the serializer can't handle, so the
  // whole page's dehydration stream failed silently on every route. This
  // wires React Query's own dehydrate/hydrate (which produce/consume a
  // plain, serializable snapshot) into the router's SSR lifecycle instead.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
