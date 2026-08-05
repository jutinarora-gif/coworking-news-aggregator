import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Users, Building2 } from "lucide-react";
import { ALL_GUIDES_META, WRITTEN_GUIDES } from "@/content/guides/registry";
import type { GuideMeta } from "@/content/guides/types";

export const Route = createFileRoute("/guides/")({
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

function GuideCard({ guide }: { guide: GuideMeta }) {
  const isWritten = WRITTEN_GUIDES.has(guide.slug);
  const content = (
    <div className="rounded-2xl border border-border/60 p-5 h-full">
      <div className="font-display text-lg leading-snug">{guide.title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground">{guide.dek}</p>
      {isWritten ? (
        <div className="mt-3 text-[11px] uppercase tracking-wide text-iris">{guide.readMins} min read</div>
      ) : (
        <div className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground/70">Coming soon</div>
      )}
    </div>
  );
  if (!isWritten) return content;
  return (
    <Link to="/guides/$slug" params={{ slug: guide.slug }} className="block hover:border-iris/60 transition-colors rounded-2xl">
      {content}
    </Link>
  );
}

function GuidesPage() {
  const coworkerGuides = ALL_GUIDES_META.filter((g) => g.category === "coworkers");
  const operatorGuides = ALL_GUIDES_META.filter((g) => g.category === "operators");

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
          {coworkerGuides.map((g) => <GuideCard key={g.slug} guide={g} />)}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2 font-display text-2xl">
          <Building2 className="h-5 w-5 text-iris" /> For operators
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operatorGuides.map((g) => <GuideCard key={g.slug} guide={g} />)}
        </div>
      </section>
    </div>
  );
}
