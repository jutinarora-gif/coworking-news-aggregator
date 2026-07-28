import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getWinners } from "@/lib/data.functions";
import { Trophy, Star, Users, Sparkles } from "lucide-react";

const q = queryOptions({ queryKey: ["winners"], queryFn: () => getWinners() });

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "Top Winners , The Coworking Dispatch" },
      {
        name: "description",
        content:
          "India's top-scoring coworking spaces, ranked by a transparent formula combining average rating, review volume, and the share of 5-star reviews. Only spaces scoring 80+ qualify.",
      },
      { property: "og:title", content: "Top Coworking Spaces in India" },
      { property: "og:description", content: "Ranked by a transparent, published scoring formula. Only spaces scoring 80+ make the list." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: WinnersPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function WinnersPage() {
  const { data } = useSuspenseQuery(q);
  const weekStart = data[0]?.week_start;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />This week's leaderboard</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Top winners</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
        The coworking spaces India is actually talking about right now, not the ones with the biggest ad
        budget. A space only makes this list if it scores <strong className="text-foreground">80 or higher</strong> out
        of 100 on our published formula below.
      </p>
      {weekStart && (
        <p className="mt-2 text-xs text-muted-foreground">
          Week of {new Date(weekStart).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · refreshed every Monday
        </p>
      )}

      <section className="mt-10 glass rounded-2xl p-6 md:p-8">
        <div className="text-xs uppercase tracking-widest text-iris">How we score</div>
        <h2 className="mt-1 font-display text-2xl md:text-3xl">No black box. Here's the exact formula.</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="flex gap-3">
            <Star className="h-5 w-5 text-iris shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-lg">60% · Average rating</div>
              <p className="mt-1 text-sm text-muted-foreground">
                A space's average star rating (out of 5), scaled to 60 points. The single biggest factor:
                a beloved space with mediocre volume still beats a mediocre space with lots of reviews.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Users className="h-5 w-5 text-iris shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-lg">25% · Review volume</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Reviews are capped at 30 for scoring purposes, so a space with 200 reviews doesn't
                automatically beat one with 35, but a handful of reviews isn't enough to rank highly either.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-iris shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-lg">15% · Share of 5-star reviews</div>
              <p className="mt-1 text-sm text-muted-foreground">
                What fraction of all reviews are a genuine 4.5–5 stars. Rewards consistency, not just a
                good average propped up by a few outliers.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground border-t border-border/40 pt-4">
          Score = (avg rating ÷ 5 × 60) + (min(review count, 30) ÷ 30 × 25) + (% of 4.5★+ reviews × 15).
          Recomputed weekly from every visible review. No editorial input, no paid placement.
        </p>
      </section>

      <ol className="mt-10 space-y-3">
        {data.map((w) => (
          <li key={`${w.week_start}-${w.rank}`}>
            <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="group block glass rounded-2xl p-4 hover-glow hover:hover-glow-hover">
              <div className="flex items-center gap-5">
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
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-display text-lg">{w.breakdown.ratingComponent}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating ({w.breakdown.avgRating}★)</div>
                </div>
                <div>
                  <div className="font-display text-lg">{w.breakdown.volumeComponent}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Volume ({w.breakdown.reviewCount} reviews)</div>
                </div>
                <div>
                  <div className="font-display text-lg">{w.breakdown.fiveStarComponent}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">5-star share</div>
                </div>
              </div>
            </Link>
            <p className="mt-2 px-4 text-sm text-muted-foreground">
              <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="text-iris hover:underline">{w.space!.name}</Link> ranks #{w.rank} this week among{" "}
              <Link to="/spaces" search={{ city: w.space!.city_name ?? undefined }} className="text-iris hover:underline">
                coworking spaces in {w.space!.city_name}
              </Link>
              , scoring {w.score.toFixed(1)}/100 on a {w.breakdown.avgRating}★ average across {w.breakdown.reviewCount} member{" "}
              <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="text-iris hover:underline">reviews</Link>. See how it compares to the rest of{" "}
              <Link to="/spaces" className="text-iris hover:underline">the full spaces directory</Link>, or catch up on{" "}
              <Link to="/dispatches" className="text-iris hover:underline">the latest coworking news</Link>.
            </p>
          </li>
        ))}
      </ol>

      {data.length === 0 && (
        <div className="mt-16 text-center text-muted-foreground">
          No space has crossed the 80-point threshold yet this week.
        </div>
      )}
    </div>
  );
}
