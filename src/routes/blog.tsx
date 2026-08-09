import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: BlogLayout,
});

function BlogLayout() {
  return <Outlet />;
}
