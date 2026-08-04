import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { getHomeData, subscribeNewsletter } from "@/lib/data.functions";
import { DispatchCard } from "@/components/site/dispatch-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Trophy, Search, HelpCircle, AlertTriangle, PenLine } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Coworking Dispatch , India-first coworking news & reviews" },
      { name: "description", content: "News, real-user reviews, Space of the Week, weekly winners, and a community Q&A for India's coworking scene." },
      { property: "og:title", content: "The Coworking Dispatch" },
      { property: "og:description", content: "India-first coworking news & community." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <div>
      <Hero />

      {data.spaceOfWeek?.space && (
        <section className="mx-auto max-w-7xl px-6 mt-20">
          <SectionHeader eyebrow="Space of the week" icon={<Sparkles className="h-4 w-4" />} title={`${data.spaceOfWeek.space.name}, ${data.spaceOfWeek.space.city_name ?? ""}`} href="/spaces" />
          <div className="mt-6 glass rounded-3xl overflow-hidden grid md:grid-cols-2">
            {data.spaceOfWeek.space.cover_url && (
              <div className="relative aspect-[4/3] md:aspect-auto">
                <img src={data.spaceOfWeek.space.cover_url} alt={data.spaceOfWeek.space.name} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40 md:to-background/60" />
              </div>
            )}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="text-xs uppercase tracking-widest text-iris">This week's pick</div>
              <h3 className="font-display text-3xl md:text-4xl mt-2">{data.spaceOfWeek.space.name}</h3>
              <div className="text-sm text-muted-foreground mt-1">{data.spaceOfWeek.space.city_name}</div>
              <p className="mt-4 text-muted-foreground leading-relaxed italic">"{data.spaceOfWeek.note}"</p>
              <div className="mt-6">
                <Button asChild className="gradient-iris text-primary-foreground">
                  <Link to="/spaces/$slug" params={{ slug: data.spaceOfWeek.space.slug }}>
                    Visit the profile <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {data.winners.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 mt-20">
          <SectionHeader eyebrow="Top winners this week" icon={<Trophy className="h-4 w-4" />} title="The five spaces India is talking about" href="/winners" />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {data.winners.map((w) => (
              <Link key={w.rank} to="/spaces/$slug" params={{ slug: w.space!.slug }} className="group glass rounded-2xl overflow-hidden hover-glow hover:hover-glow-hover relative">
                <div className="absolute top-3 left-3 z-10 h-10 w-10 rounded-xl gradient-iris flex items-center justify-center font-display text-xl text-primary-foreground shadow-[0_0_24px_-4px_var(--iris-2)]">#{w.rank}</div>
                {w.space!.cover_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={w.space!.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-4">
                  <div className="font-display text-lg">{w.space!.name}</div>
                  <div className="text-xs text-muted-foreground">{w.space!.city_name}</div>
                  <div className="text-xs mt-2 text-iris">Score {w.score.toFixed(1)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SalesQuestions items={data.salesQuestions} />

      <RedFlags />

      <ReviewNudge />

      <section className="mx-auto max-w-7xl px-6 mt-20">
        <SectionHeader eyebrow="Latest dispatches" title="Fresh from the wire" href="/dispatches" />
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.dispatches.slice(0, 9).map((d, i) => (
            <DispatchCard key={d.id} d={d} featured={i === 0} />
          ))}
        </div>
      </section>

      <NewsletterCTA />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const [heroQuery, setHeroQuery] = useState("");

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative overflow-hidden pt-20 pb-20"
    >
      <div
        className="absolute inset-0 -z-10 transition-[background-position] duration-300 ease-out"
        style={{
          background: `radial-gradient(600px 400px at ${pos.x}% ${pos.y}%, oklch(0.78 0.14 340 / 0.45), transparent 60%),
                       radial-gradient(500px 350px at ${100 - pos.x}% ${100 - pos.y}%, oklch(0.75 0.15 220 / 0.40), transparent 60%),
                       radial-gradient(700px 500px at 50% 0%, oklch(0.68 0.18 295 / 0.25), transparent 65%)`,
        }}
      />

      <div className="mx-auto max-w-5xl px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Live, 70% India, 30% world
        </div>
        <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05]">
          Coworking News, Reviews, and Real Talk from <span className="text-iris">Everywhere</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Aggregated news, member reviews from real coworking spaces, weekly winners, and the questions you should actually ask the salesperson before you sign.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("app:open-search", { detail: { query: heroQuery } }));
          }}
          className="mt-8 max-w-xl mx-auto flex items-center gap-2 glass rounded-2xl p-2 relative z-10"
        >
          <Search className="h-5 w-5 ml-3 text-muted-foreground" />
          <Input
            value={heroQuery}
            onChange={(e) => {
              const value = e.target.value;
              setHeroQuery(value);
              // Open with live suggestions as soon as typing starts, instead
              // of waiting for submit; the dialog's own input takes over
              // from here and keeps updating results as the user keeps typing.
              if (value.trim()) {
                window.dispatchEvent(new CustomEvent("app:open-search", { detail: { query: value } }));
              }
            }}
            placeholder="Search 'Awfis', 'Koramangala', 'Bangalore'…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
          />
          <Button type="submit" className="gradient-iris text-primary-foreground">Search</Button>
        </form>
      </div>

    </section>
  );
}

function SectionHeader({ eyebrow, title, href, icon }: { eyebrow: string; title: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full gradient-iris px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_24px_-6px_var(--iris-2)]">{icon}{eyebrow}</div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-muted-foreground">{title}</h2>
      </div>
      {href && (
        <Link to={href} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
      )}
    </div>
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
    <section className="mx-auto max-w-4xl px-6 mt-24">
      <div className="glass-strong rounded-3xl p-10 text-center overflow-hidden relative">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-40 gradient-iris" />
        <div className="text-xs uppercase tracking-widest text-iris">The Wednesday Dispatch</div>
        <h3 className="mt-2 font-display text-3xl md:text-4xl">One email. Every Wednesday. India's coworking week in five minutes.</h3>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="mt-6 max-w-md mx-auto flex gap-2">
          <Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={mut.isPending} className="gradient-iris text-primary-foreground">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}

function SalesQuestions({ items }: { items: { id: string; text: string; category: string | null }[] }) {
  if (!items?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 mt-20">
      <SectionHeader
        eyebrow="Before you sign"
        icon={<HelpCircle className="h-4 w-4" />}
        title="Questions to ask the salesperson"
      />
      <p className="mt-2 text-sm text-muted-foreground">A checklist to bring to your tour, not a link. Nothing here to click.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((q, i) => (
          <div
            key={q.id}
            className="glass rounded-2xl p-5 flex gap-4 cursor-default"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl gradient-iris flex items-center justify-center font-display text-primary-foreground">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <p className="font-display text-lg leading-snug">{q.text}</p>
              {q.category && (
                <div className="mt-1 text-xs uppercase tracking-widest text-iris">{q.category}</div>
              )}
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

function ReviewNudge() {
  return (
    <section className="mx-auto max-w-6xl px-6 mt-16">
      <div className="glass-strong rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl gradient-iris flex items-center justify-center">
            <PenLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-iris">Been to a space this month?</div>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">Leave a review. It takes under two minutes.</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Real ratings from real coworkers are the whole point of this site. Find your space and rate it.
            </p>
          </div>
        </div>
        <Button asChild className="gradient-iris text-primary-foreground shrink-0">
          <Link to="/spaces">Find your space →</Link>
        </Button>
      </div>
    </section>
  );
}

function RedFlags() {
  return (
    <section className="mx-auto max-w-6xl px-6 mt-16">
      <div className="glass rounded-2xl p-6 md:p-8 border border-destructive/20">
        <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-destructive-foreground">
          <AlertTriangle className="h-4 w-4" /> Red flags
        </div>
        <h2 className="mt-3 font-display text-2xl md:text-3xl text-muted-foreground">Spot two of these? Time to rethink your coworking space</h2>
        <ul className="mt-5 grid gap-x-6 gap-y-2 md:grid-cols-2 text-sm">
          {RED_FLAGS.map((f, i) => (
            <li key={f} className="flex gap-2.5 items-baseline py-1.5 border-b border-border/40 last:border-0 md:[&:nth-last-child(2)]:border-0">
              <span className="text-xs font-display text-destructive/70 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-muted-foreground leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}


