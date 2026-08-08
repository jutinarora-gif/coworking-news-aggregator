import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSpace } from "@/lib/data.functions";
import { Star, MapPin, Wifi, Volume2, Users, Coffee, IndianRupee, ClipboardCheck, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustLine } from "@/components/site/trust-line";

type ReviewSort = "newest" | "oldest" | "highest" | "lowest";

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

function sortReviews(reviews: any[], sort: ReviewSort) {
  const copy = [...reviews];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case "highest":
      return copy.sort((a, b) => b.rating_overall - a.rating_overall);
    case "lowest":
      return copy.sort((a, b) => a.rating_overall - b.rating_overall);
    case "newest":
    default:
      return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

const q = (slug: string) => queryOptions({ queryKey: ["space", slug], queryFn: () => getSpace({ data: { slug } }) });

export const Route = createFileRoute("/spaces/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(q(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => {
    const city = loaderData?.space.city_name;
    const title = loaderData
      ? city
        ? `${loaderData.space.name} – Coworking Space in ${city} | Reviews & Pricing | The Coworking Dispatch`
        : `${loaderData.space.name} – Reviews & Pricing | The Coworking Dispatch`
      : "Space";
    const description = loaderData?.space.description ?? (loaderData ? `Reviews and details for ${loaderData.space.name}` : "");
    return {
      meta: loaderData ? [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.space.cover_url ? [{ property: "og:image", content: loaderData.space.cover_url }, { name: "twitter:image", content: loaderData.space.cover_url }] : []),
      ] : [{ title: "Space" }],
      links: loaderData ? [{ rel: "canonical", href: `https://www.coworkingdispatch.com/spaces/${loaderData.space.slug}` }] : [],
    };
  },
  component: SpacePage,
  notFoundComponent: () => <div className="p-16 text-center">Space not found</div>,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function SpacePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(q(slug));
  if (!data) return null;
  const { space, reviews, agg, priceContext, salesQuestions } = data;
  const [sort, setSort] = useState<ReviewSort>("newest");
  const sortedReviews = useMemo(() => sortReviews(reviews, sort), [reviews, sort]);
  return (
    <div>
      <div className="relative h-[45vh] min-h-[380px] overflow-hidden">
        {space.cover_url && <img src={space.cover_url} alt={space.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-8">
          <Link to="/spaces" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" />All spaces</Link>
          <div className="flex flex-wrap items-end justify-between gap-4 mt-3">
            <div>
              <h1 className="font-display text-4xl md:text-6xl">{space.name}</h1>
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />{space.city_name} · {space.address}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {space.vibe_tags?.map((t: string) => <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full glass">{t}</span>)}
              </div>
            </div>
            {agg && (
              <div className="glass rounded-2xl px-6 py-4 text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Star className="h-6 w-6 fill-primary text-primary" />
                  <span className="font-display text-4xl">{agg.avg}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{agg.n} reviews</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {space.description && (
            <section className="glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />Overview</div>
              <p className="mt-3 text-lg leading-relaxed">{space.description}</p>
              {space.price_from && (
                <div className="mt-4 text-sm">
                  <span className="text-muted-foreground">Hot desk from</span>{" "}
                  <span className="font-medium text-lg">{space.currency === "INR" ? "₹" : "$"}{space.price_from.toLocaleString()}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              )}
              {space.amenities && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(space.amenities as string[]).map((a) => <span key={a} className="text-xs px-2 py-1 rounded-md bg-muted">{a}</span>)}
                </div>
              )}
              <TrustLine className="mt-5 pt-4 border-t border-border/40" />
            </section>
          )}

          {priceContext && space.price_from && (
            <section className="glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" /><IndianRupee className="h-3.5 w-3.5" />Price in context</div>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="font-display text-4xl">{space.currency === "INR" ? "₹" : "$"}{space.price_from.toLocaleString()}</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    That's{" "}
                    <span className={`font-medium ${priceContext.pctVsMedian < 0 ? "text-flare" : "text-foreground"}`}>
                      {priceContext.pctVsMedian === 0 ? "right at" : `${priceContext.pctVsMedian > 0 ? "+" : ""}${priceContext.pctVsMedian}%`}
                    </span>{" "}
                    {priceContext.pctVsMedian !== 0 && (priceContext.pctVsMedian < 0 ? "below" : "above")} the {space.city_name} median across {priceContext.count} listed spaces.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Median</span><span className="font-medium">{space.currency === "INR" ? "₹" : "$"}{Math.round(priceContext.median).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span className="font-medium">{space.currency === "INR" ? "₹" : "$"}{priceContext.min.toLocaleString()} – {space.currency === "INR" ? "₹" : "$"}{priceContext.max.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rank</span><span className="font-medium">{ordinal(priceContext.rank)} cheapest of {priceContext.count}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Spaces pricier</span><span className="font-medium">{priceContext.cheaperThan}</span></div>
                </div>
              </div>
              {priceContext.sameCity.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Also in {space.city_name}</h4>
                  <ul className="mt-3 space-y-2">
                    {priceContext.sameCity.map((s) => (
                      <li key={s.slug}>
                        <Link to="/spaces/$slug" params={{ slug: s.slug }} className="group flex items-center justify-between rounded-xl p-2 hover:bg-accent/50">
                          <span className="font-medium group-hover:text-muted-foreground transition-colors">{s.name}</span>
                          <span className="text-sm tabular-nums">{s.currency === "INR" ? "₹" : "$"}{s.price_from.toLocaleString()}<span className="text-muted-foreground text-xs">/mo</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {agg && (
            <section className="glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />Ratings breakdown</div>
              {(() => {
                const rows = [
                  { l: "Wifi", v: agg.wifi, i: Wifi },
                  { l: "Quiet", v: agg.quiet, i: Volume2 },
                  { l: "Community", v: agg.community, i: Users },
                  { l: "Coffee", v: agg.coffee, i: Coffee },
                  { l: "Value", v: agg.value, i: IndianRupee },
                ];
                const best = Math.max(...rows.map((r) => Number(r.v ?? 0)));
                return (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {rows.map(({ l, v, i: Icon }) => {
                      const top = v != null && Number(v) === best && best > 0;
                      return (
                        <div key={l} className="text-center">
                          <Icon className={`h-5 w-5 mx-auto ${top ? "text-foreground" : "text-muted-foreground"}`} />
                          <div className="mt-2 font-display text-2xl">{v ?? "-"}</div>
                          <div className="mx-auto mt-2 h-1.5 w-full max-w-[72px] overflow-hidden rounded-full bg-muted">
                            <span className={`block h-full rounded-full ${top ? "bg-flare" : "bg-foreground/25"}`} style={{ width: `${((Number(v ?? 0)) / 5) * 100}%` }} />
                          </div>
                          <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />What coworkers say</div>
                <h2 className="font-display text-3xl mt-1">{reviews.length > 0 ? `${reviews.length} reviews` : "No reviews yet"}</h2>
              </div>
              <div className="flex items-center gap-2">
                {reviews.length > 1 && (
                  <Select value={sort} onValueChange={(v) => setSort(v as ReviewSort)}>
                    <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="highest">Highest rated</SelectItem>
                      <SelectItem value="lowest">Lowest rated</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button asChild variant="mint" size="sm">
                  <Link to="/review/$slug" params={{ slug: space.slug }}>Leave a review</Link>
                </Button>
              </div>
            </div>
            {reviews.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                No reviews yet. We don't invent them — real ones will appear here as coworkers add them.
              </p>
            )}
            <div className="mt-6 space-y-4">
              {sortedReviews.slice(0, 30).map((r: any) => (
                <div key={r.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback>{r.author?.display_name?.[0] ?? "?"}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{r.author?.display_name}</div>
                        <div className="text-xs text-muted-foreground" title={format(new Date(r.created_at), "PPP")}>
                          {format(new Date(r.created_at), "MMM d, yyyy")} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{r.rating_overall}</span>
                    </div>
                  </div>
                  {r.title && <div className="mt-3 font-display text-lg">{r.title}</div>}
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{r.body}</p>
                  {(r.pros || r.cons) && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {r.pros && <div className="text-xs"><span className="text-primary">Pros</span><div className="mt-1 text-muted-foreground whitespace-pre-line">{r.pros}</div></div>}
                      {r.cons && <div className="text-xs"><span className="text-destructive">Cons</span><div className="mt-1 text-muted-foreground whitespace-pre-line">{r.cons}</div></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="glass rounded-2xl p-6 sticky top-20">
            <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" /><ClipboardCheck className="h-3.5 w-3.5" />Ask the salesperson</div>
            <h3 className="mt-2 font-display text-xl">Before you sign</h3>
            <p className="text-xs text-muted-foreground mt-1">Copy-paste these to your tour email. Community-curated.</p>
            <ol className="mt-4 space-y-2.5">
              {salesQuestions.map((sq: any, i: number) => (
                <li key={sq.id} className="text-sm flex gap-2">
                  <span className="acid-mark font-display text-lg leading-none">{i + 1}.</span>
                  <span>{sq.text}</span>
                </li>
              ))}
            </ol>
            <Button className="mt-4 w-full" variant="mint" size="lg" onClick={() => {
              const text = salesQuestions.map((q: any, i: number) => `${i + 1}. ${q.text}`).join("\n");
              navigator.clipboard.writeText(text);
            }}>Copy all questions</Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
