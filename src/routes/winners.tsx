import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getWinners } from "@/lib/data.functions";
import { IndianRupee, Layers, MapPinned } from "lucide-react";
import { cardImageUrl } from "@/lib/utils";
import { canonicalLink } from "@/lib/seo";

const q = queryOptions({ queryKey: ["winners"], queryFn: () => getWinners() });

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "Best Value , The Coworking Dispatch" },
      {
        name: "description",
        content: "Coworking spaces in India ranked by price-to-amenity value against their own city, not by paid placement or reviews.",
      },
      { property: "og:title", content: "Best Value Coworking Spaces in India" },
      { property: "og:description", content: "Ranked by a published, arithmetic formula: price and amenities, compared within each city." },
    ],
    links: [canonicalLink("/winners")],
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
      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />
        <IndianRupee className="h-3.5 w-3.5" />Price intelligence
      </div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Best value</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
        No reviews, no opinions, no paid placement — just arithmetic on price and amenities, compared against
        other spaces in the same city.
      </p>
      {weekStart && (
        <p className="mt-2 text-xs text-muted-foreground">
          Week of {new Date(weekStart).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · refreshed every Monday
        </p>
      )}

      <section className="mt-10 glass rounded-2xl p-6 md:p-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />How we score
        </div>
        <h2 className="mt-1 font-display text-2xl md:text-3xl">No black box. Here's the exact formula.</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <IndianRupee className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-lg">65% · Price, within the city</div>
              <p className="mt-1 text-sm text-muted-foreground">
                How this space's hot-desk price compares to every other space in the same city — cheapest
                scores highest. A space is never compared to a different city's price level.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Layers className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-lg">35% · Amenity count, within the city</div>
              <p className="mt-1 text-sm text-muted-foreground">
                How many listed amenities this space has compared to its same-city peers. More amenities at
                a lower price is the definition of value we're using.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground border-t border-border/40 pt-4 flex items-start gap-2">
          <MapPinned className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Only cities with at least 3 listed spaces are ranked — a single space has no local peers to be
          better value than. Recomputed weekly straight from the directory. No editorial input, no paid
          placement, no reviews required.
        </p>
      </section>

      <ol className="mt-10 space-y-3">
        {data.map((w) => (
          <li key={`${w.week_start}-${w.rank}`}>
            <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="group block glass rounded-2xl p-4 hover-glow hover:hover-glow-hover">
              <div className="flex items-center gap-5">
                <div className={`h-14 w-14 shrink-0 rounded-full flex items-center justify-center font-display text-2xl ${w.rank === 1 ? "bg-flare text-flare-ink" : "bg-foreground text-background"}`}>#{w.rank}</div>
                {w.space!.cover_url && <img src={cardImageUrl(w.space!.cover_url, 200) ?? undefined} alt="" className="h-14 w-20 rounded-lg object-cover" />}
                <div className="flex-1">
                  <div className="font-display text-xl group-hover:text-muted-foreground">{w.space!.name}</div>
                  <div className="text-xs text-muted-foreground">{w.space!.city_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl">{w.score.toFixed(1)}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Value score</div>
                </div>
              </div>
              {w.breakdown && (
                <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="font-display text-lg">
                      {w.breakdown.price_from != null ? `${w.breakdown.currency === "INR" ? "₹" : "$"}${w.breakdown.price_from.toLocaleString()}` : "—"}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hot desk / mo</div>
                  </div>
                  <div>
                    <div className="font-display text-lg">{w.breakdown.amenity_count}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Amenities listed</div>
                  </div>
                </div>
              )}
            </Link>
            <p className="mt-2 px-4 text-sm text-muted-foreground">
              <Link to="/spaces/$slug" params={{ slug: w.space!.slug }} className="acid-underline hover:acid-underline-hover font-medium text-foreground">{w.space!.name}</Link> ranks #{w.rank} this week for value among{" "}
              <Link to="/spaces" search={{ city: w.space!.city_name ?? undefined }} className="acid-underline hover:acid-underline-hover font-medium text-foreground">
                coworking spaces in {w.space!.city_name}
              </Link>
              , scoring {w.score.toFixed(1)}/100 on price and amenities compared to its local peers. See how it compares to the rest of{" "}
              <Link to="/spaces" className="acid-underline hover:acid-underline-hover font-medium text-foreground">the full spaces directory</Link>, or catch up on{" "}
              <Link to="/dispatches" className="acid-underline hover:acid-underline-hover font-medium text-foreground">the latest coworking news</Link>.
            </p>
          </li>
        ))}
      </ol>

      {data.length === 0 && (
        <div className="mt-16 text-center text-muted-foreground">
          Not enough priced spaces in any one city yet to rank fairly.
        </div>
      )}
    </div>
  );
}
