import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getWinners } from "@/lib/data.functions";
import { Trophy } from "lucide-react";

const q = queryOptions({ queryKey: ["winners"], queryFn: () => getWinners() });

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "Top Winners , The Coworking Dispatch" },
      { name: "description", content: "This week's top coworking spaces in India, ranked by reviews, community activity, and mentions." },
      { property: "og:title", content: "Top Coworking Spaces this week" },
      { property: "og:description", content: "The five spaces India is talking about." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: WinnersPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function WinnersPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />This week's leaderboard</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Top winners</h1>
      <p className="mt-2 text-muted-foreground">Weighted by review volume, ratings, and community activity. Refreshed every Monday.</p>
      <ol className="mt-10 space-y-3">
        {data.map((w) => (
          <li key={`${w.week_start}-${w.rank}`}>
            <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="group flex items-center gap-5 glass rounded-2xl p-4 hover-glow hover:hover-glow-hover">
              <div className="h-14 w-14 shrink-0 rounded-xl gradient-iris flex items-center justify-center font-display text-2xl text-primary-foreground shadow-[0_0_24px_-4px_var(--iris-2)]">#{w.rank}</div>
              {w.space!.cover_url && <img src={w.space!.cover_url} alt="" className="h-14 w-20 rounded-lg object-cover" />}
              <div className="flex-1">
                <div className="font-display text-xl group-hover:text-iris">{w.space!.name}</div>
                <div className="text-xs text-muted-foreground">{w.space!.city_name}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl">{w.score.toFixed(1)}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
