import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { getHomeData, getLeaderboards, subscribeNewsletter } from "@/lib/data.functions";
import { HeroStage } from "@/components/site/hero-stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canonicalLink } from "@/lib/seo";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cardImageUrl } from "@/lib/utils";

const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });
const leaderboardsQuery = queryOptions({ queryKey: ["leaderboards"], queryFn: () => getLeaderboards() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Coworking Dispatch , India-first coworking news & reviews" },
      { name: "description", content: "News, member reviews, Space of the Week, weekly winners, and a community Q&A for India's coworking scene." },
      { property: "og:title", content: "The Coworking Dispatch" },
      { property: "og:description", content: "India-first coworking news & community." },
    ],
    links: [canonicalLink("/")],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(leaderboardsQuery),
    ]),
  component: Home,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
});

const WRAP = "mx-auto w-full max-w-[1400px] px-5 sm:px-8";

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const { data: leaderboards } = useSuspenseQuery(leaderboardsQuery);

  return (
    <div className="pb-0">
      <Hero />
      <section id="leaderboard" className={`${WRAP} mt-20 scroll-mt-24`}>
        <Leaderboards data={leaderboards} />
      </section>
      {data.spaceOfWeek?.space && <SpaceOfWeek data={data.spaceOfWeek} />}
      {data.winners.length > 0 && <Winners winners={data.winners} />}
      <SalesQuestions items={data.salesQuestions} />
      <RedFlags />
      <ReviewCTA />
      <Dispatches items={data.dispatches.slice(0, 9)} />
      <NewsletterCTA />
    </div>
  );
}

function Hero() {
  return (
    <section>
      <div className="section-mist -mt-16 pt-16">
        <div className={WRAP}>
          <HeroStage />
        </div>
      </div>
      <div className={`${WRAP} mt-10 grid gap-6 border-b border-border pb-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end`}>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Aggregated news, member reviews, weekly winners, and the questions you should actually ask the salesperson before you sign.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/dispatches">Read the dispatches <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/spaces">Browse spaces</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-foreground pb-4">
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-none sm:text-[2rem]">
          <span className="acid-dot mr-2 inline-block h-2 w-2 translate-y-[-0.15em] rounded-full" />
          {eyebrow}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{title}</p>
      </div>
      {href && (
        <Link to={href} className="shrink-0 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
          {cta ?? "View all"}
        </Link>
      )}
    </div>
  );
}

const LEADERBOARD_CATEGORIES: { key: "wifi" | "community" | "clean" | "support" | "ac" | "meet"; label: string }[] = [
  { key: "wifi", label: "Best Wifi" },
  { key: "community", label: "Best Community" },
  { key: "clean", label: "Cleanest Spaces" },
  { key: "support", label: "Best On-Ground Support" },
  { key: "ac", label: "Most Consistent AC" },
  { key: "meet", label: "Most Private Meeting Rooms" },
];

function Leaderboards({ data }: { data: Awaited<ReturnType<typeof getLeaderboards>> }) {
  const [active, setActive] = useState(0);
  const current = LEADERBOARD_CATEGORIES[active];
  const entries = data[current.key] ?? [];

  return (
    <>
      <SectionHead eyebrow="India leaderboard" title="Pick a category. See who wins." href="/winners" cta="All winners" />

      <div className="mt-6 flex flex-wrap gap-2">
        {LEADERBOARD_CATEGORIES.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              i === active
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            to="/spaces/$slug"
            params={{ slug: entry.slug }}
            className={`group relative overflow-hidden rounded-2xl border border-border p-6 transition-all hover:-translate-y-0.5 hover:border-foreground ${
              entry.rank === 1 ? "bg-flare text-flare-ink" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-bold leading-none tabular-nums opacity-90">{entry.rank}</span>
            </div>
            <div className="mt-8 font-display text-xl leading-tight">{entry.name}</div>
            <div className={`mt-1 text-xs uppercase tracking-widest ${entry.rank === 1 ? "opacity-70" : "text-muted-foreground"}`}>
              {entry.cityName}
            </div>
          </Link>
        ))}
        {entries.length === 0 && (
          <div className="text-sm text-muted-foreground/60">Not enough data yet</div>
        )}
      </div>

      <p className="label mt-6">Based on community reviews and ratings on The Coworking Dispatch. Rankings update as more reviews come in.</p>
    </>
  );
}

function SpaceOfWeek({ data }: { data: any }) {
  const s = data.space;
  return (
    <section className="section-ink mt-24 py-16 sm:py-20">
      <div className={WRAP}>
        <SectionHead eyebrow="Space of the week" title="This week's pick" href="/spaces" cta="All spaces" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {s.cover_url && (
            <div className="aspect-[16/11] overflow-hidden rounded-3xl bg-muted">
              <img src={cardImageUrl(s.cover_url, 900) ?? undefined} alt={s.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="max-w-xl">
            <h3 className="font-display text-4xl leading-[0.95] sm:text-6xl">{s.name}</h3>
            <div className="label mt-3">{s.city_name}</div>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{data.note}</p>
            <Link
              to="/spaces/$slug"
              params={{ slug: s.slug }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-flare px-5 py-2.5 text-sm font-medium text-flare-ink transition-transform hover:-translate-y-0.5"
            >
              Visit the profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Winners({ winners }: { winners: any[] }) {
  return (
    <section className={`${WRAP} mt-24`}>
      <SectionHead eyebrow="Weekly winners" title="Five spaces India is talking about" href="/winners" cta="Full leaderboard" />
      <ul className="mt-2">
        {winners.map((w) => (
          <li key={w.rank}>
            <Link
              to="/spaces/$slug"
              params={{ slug: w.space.slug }}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 border-b border-border py-5 transition-colors hover:bg-accent/50"
            >
              <span className={`w-9 font-display text-sm tabular-nums ${w.rank === 1 ? "acid-mark" : "text-muted-foreground"}`}>{String(w.rank).padStart(2, "0")}</span>
              <div className="flex min-w-0 items-center gap-4">
                {w.space.cover_url && (
                  <img src={cardImageUrl(w.space.cover_url, 200) ?? undefined} alt="" loading="lazy" className="hidden h-14 w-20 shrink-0 object-cover rounded-lg sm:block" />
                )}
                <div className="min-w-0">
                  <div className="truncate font-display text-xl acid-underline group-hover:acid-underline-hover sm:text-2xl">{w.space.name}</div>
                  <div className="label mt-0.5">{w.space.city_name}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-sm tabular-nums text-muted-foreground">{w.score.toFixed(1)}</span>
                <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SalesQuestions({ items }: { items: { id: string; text: string; category: string | null }[] }) {
  if (!items?.length) return null;
  return (
    <section className={`${WRAP} mt-24`}>
      <SectionHead eyebrow="Before you sign" title="Ask the salesperson this" />
      <p className="mt-2 text-sm text-muted-foreground">A checklist to bring to your tour, not a link. Nothing here to click.</p>
      <div className="mt-2 grid md:grid-cols-2 md:gap-x-12">
        {items.map((q, i) => (
          <div key={q.id} className="group flex gap-5 border-b border-border py-5">
            <span className="font-display text-sm tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="text-lg leading-snug">{q.text}</p>
              {q.category && <div className="label mt-1.5">{q.category}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const RED_FLAGS = [
  "The wi-fi keeps dropping mid-call",
  "The washrooms smell, and nobody owns cleaning",
  "Your complaint disappears into a WhatsApp group",
  "It is always noisy, phone booths are permanently booked",
  "The community manager plays favourites with a few clients",
  "Printers, coffee, or meeting rooms are always 'out of order'",
  "Contracts have quiet auto-renewal and steep exit fees",
];

function RedFlags() {
  return (
    <section className={`${WRAP} mt-24`}>
      <div className="rounded-3xl border border-border p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div>
            <h2 className="font-display text-2xl leading-none sm:text-[2rem]">
              <span className="acid-dot mr-2 inline-block h-2 w-2 translate-y-[-0.15em] rounded-full" />
              Red flags
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Spot two of these? Time to rethink your coworking space.
            </p>
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {RED_FLAGS.map((f, i) => (
              <li key={f} className="flex gap-3 border-b border-border py-3 text-sm last:border-0 sm:[&:nth-last-child(2)]:border-0">
                <span className="acid-mark tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-snug text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReviewCTA() {
  return (
    <section className={`${WRAP} mt-20`}>
      <div className="grid items-center gap-6 border-y border-border py-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h2 className="font-display text-2xl leading-none sm:text-[2rem]">
            <span className="acid-dot mr-2 inline-block h-2 w-2 translate-y-[-0.15em] rounded-full" />
            Been to a space this month?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Leave a review. It takes <span className="acid-mark">under two minutes.</span>
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            The more coworkers who weigh in, the more useful this gets for the next person choosing a space.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/spaces">Find your space <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  );
}

function Dispatches({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className={`${WRAP} mt-24`}>
      <SectionHead eyebrow="Latest dispatches" title="Fresh from the wire" href="/dispatches" />
      <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <Link key={d.id} to="/dispatches/$slug" params={{ slug: d.slug }} className="group block">
            {d.cover_url && (
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={cardImageUrl(d.cover_url, 640) ?? undefined} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
            )}
            <div className="label mt-4 flex items-center gap-2">
              <span>{d.region === "india" ? "India" : "Global"}</span>
              <span>/</span>
              <span className="truncate">{d.source_name}</span>
            </div>
            <h3 className="mt-2 font-display text-xl leading-snug acid-underline group-hover:acid-underline-hover">{d.title}</h3>
            {d.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.excerpt}</p>}
            <div className="label mt-3">{formatDistanceToNow(new Date(d.ingested_at), { addSuffix: true })}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const mut = useMutation({
    mutationFn: () => subscribeNewsletter({ data: { email } }),
    onSuccess: () => { toast.success("You're in. Watch for the Wednesday Dispatch."); setEmail(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <section className={`${WRAP} mt-28 mb-24`}>
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-flare px-7 py-12 text-flare-ink sm:px-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-end">
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-none sm:text-[2.5rem]">The Wednesday Dispatch</h2>
            <p className="mt-3 max-w-md text-sm opacity-80 sm:text-base">
              India's coworking week, in five minutes. Every Wednesday.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full border-flare-ink/25 bg-background px-5 text-foreground"
            />
            <Button type="submit" disabled={mut.isPending} className="h-12 shrink-0 rounded-full bg-flare-ink px-6 text-flare hover:bg-flare-ink/90">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
