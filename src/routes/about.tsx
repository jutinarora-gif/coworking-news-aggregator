import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Star, Trophy, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About , The Coworking Dispatch" },
      { name: "description", content: "Why we built The Coworking Dispatch: India-first coworking news, member reviews, and a transparent weekly ranking." },
      { property: "og:title", content: "About The Coworking Dispatch" },
      { property: "og:description", content: "India-first coworking news, member reviews, and a transparent weekly ranking." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris">About</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">The pulse of India's coworking scene.</h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        The Coworking Dispatch is a news, review, and community site built around one idea: coworking in India
        gets talked about constantly, but it's scattered across brand blogs, city Facebook groups, and word of
        mouth. We pull it into one place.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <Newspaper className="h-5 w-5 text-iris" />
          <h2 className="mt-3 font-display text-xl">Real news, aggregated</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our wire pulls from hundreds of publishers covering office space, coworking, and flexible workspace
            across India and the world, not just a handful of company blogs.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <Star className="h-5 w-5 text-iris" />
          <h2 className="mt-3 font-display text-xl">Open to every coworker</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every space listing has a real name, address, and price sourced from public coworking directories.
            Anyone who's actually worked out of a space can <Link to="/spaces" className="text-iris hover:underline">sign in and leave a review</Link>.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <Trophy className="h-5 w-5 text-iris" />
          <h2 className="mt-3 font-display text-xl">A transparent ranking</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our weekly winners aren't paid placements. The formula is <Link to="/winners" className="text-iris hover:underline">published in full</Link>, and only spaces scoring 80+ qualify.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <MessagesSquare className="h-5 w-5 text-iris" />
          <h2 className="mt-3 font-display text-xl">A place to actually ask</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our Q&A exists so you can ask the questions a salesperson won't volunteer, before you sign a lease
            you'll regret.
          </p>
        </div>
      </div>

      <div className="mt-10 glass-strong rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-2xl">70% India, 30% the rest of the world</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We're India-first by design. Roughly 70% of what you'll see here, spaces, dispatches, and Q&A, is
          about India's coworking scene. The other 30% covers what's happening globally, because founders here
          care what's happening in Lisbon, Berlin, or Singapore too.
        </p>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Questions, feedback, or found something that doesn't look right? <Link to="/contact" className="text-iris hover:underline">Get in touch</Link>.
      </p>
    </div>
  );
}
