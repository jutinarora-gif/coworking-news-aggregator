import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Users, Building2 } from "lucide-react";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides , The Coworking Dispatch" },
      { name: "description", content: "Practical guides for people choosing a coworking space, and for operators running one." },
      { property: "og:title", content: "Coworking Guides" },
      { property: "og:description", content: "Practical guides for coworkers and space operators." },
    ],
  }),
  component: GuidesPage,
});

type Guide = { title: string; blurb: string };

const COWORKER_GUIDES: Guide[] = [
  { title: "How to choose a coworking space", blurb: "A practical checklist for picking the right one, not just the closest one." },
  { title: "Coworking vs. traditional office", blurb: "A real cost breakdown for small teams deciding between the two." },
  { title: "GST registration and virtual offices", blurb: "What founders actually need to know before signing up." },
  { title: "Day pass vs. monthly membership", blurb: "The math on when a monthly plan actually pays off." },
  { title: "Red flags before you sign", blurb: "Contract terms and warning signs worth catching early." },
  { title: "Coworking etiquette", blurb: "The unwritten rules of sharing a workspace with strangers." },
  { title: "How to negotiate coworking rates", blurb: "Tips for growing teams asking for a better deal." },
  { title: "City guides", blurb: "What the coworking scene actually looks like in Bangalore, Mumbai, Delhi-NCR, and beyond." },
];

const OPERATOR_GUIDES: Guide[] = [
  { title: "How to list your space", blurb: "Getting your space listed on The Coworking Dispatch." },
  { title: "Getting your first reviews", blurb: "A founder's guide to building trust early on." },
  { title: "Community management 101", blurb: "Keeping members engaged once they've signed up." },
  { title: "Pricing your space competitively", blurb: "Using real market data instead of guesswork." },
  { title: "What members actually complain about", blurb: "The most common red flags coworkers report, and how to fix them." },
  { title: "Marketing without paid ads", blurb: "Organic ways to fill desks." },
  { title: "Handling a bad review the right way", blurb: "Responding without making it worse." },
  { title: "How weekly rankings are chosen", blurb: "A transparency note on Space of the Week and the leaderboard." },
];

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-display text-lg leading-snug">{guide.title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground">{guide.blurb}</p>
      <div className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground/70">Coming soon</div>
    </div>
  );
}

function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1">
        <BookOpen className="h-3.5 w-3.5" /> Guides
      </div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Guides for coworkers and operators</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        Practical, no-nonsense guides. Written as they're ready, not all at once.
      </p>

      <section className="mt-10">
        <div className="flex items-center gap-2 font-display text-2xl">
          <Users className="h-5 w-5 text-iris" /> For coworkers
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COWORKER_GUIDES.map((g) => <GuideCard key={g.title} guide={g} />)}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2 font-display text-2xl">
          <Building2 className="h-5 w-5 text-iris" /> For operators
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPERATOR_GUIDES.map((g) => <GuideCard key={g.title} guide={g} />)}
        </div>
      </section>
    </div>
  );
}
