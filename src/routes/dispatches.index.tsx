import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDispatches } from "@/lib/data.functions";
import { DispatchCard } from "@/components/site/dispatch-card";
import { PageHeading } from "@/components/site/page-heading";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";


const searchSchema = z.object({
  region: fallback(z.enum(["india", "global", "all"]), "all").default("all"),
});

export const Route = createFileRoute("/dispatches/")({
  head: () => ({
    meta: [
      { title: "Dispatches , The Coworking Dispatch" },
      { name: "description", content: "Aggregated coworking news, weighted 70% India, 30% the rest of the world." },
      { property: "og:title", content: "Dispatches , Coworking news, India-first" },
      { property: "og:description", content: "Aggregated coworking news from India and around the world." },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ region: search.region }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(dispatchesQuery(deps.region)),
  component: DispatchesPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

const dispatchesQuery = (region: "india" | "global" | "all") =>
  queryOptions({
    queryKey: ["dispatches", region],
    queryFn: () => getDispatches({ data: { region } }),
  });

function DispatchesPage() {
  const { region } = Route.useSearch();
  const { data } = useSuspenseQuery(dispatchesQuery(region));
  const navigate = Route.useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PageHeading
        eyebrow="The wire"
        title="Dispatches"
        sub="Aggregated from hundreds of publishers covering coworking, office space and flexible workspace across India and the world."
        right={
          <div className="inline-flex glass rounded-full p-1">
            {(["all", "india", "global"] as const).map((r) => (
              <button
                key={r}
                onClick={() => navigate({ to: ".", search: { region: r } })}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all ${region === r ? "bg-flare text-flare-ink" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "india" ? "🇮🇳 India" : r === "global" ? "🌏 Global" : "All"}
              </button>
            ))}
          </div>
        }
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.map((d, i) => <DispatchCard key={d.id} d={d} featured={i === 0 && region !== "global"} />)}
      </div>
      {data.length === 0 && <div className="mt-16 text-center text-muted-foreground">No dispatches yet , polling the wire…</div>}
    </div>
  );
}
