import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Star, Trophy, MessagesSquare } from "lucide-react";
import { PageHeading } from "@/components/site/page-heading";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About , The Coworking Dispatch" },
      { name: "description", content: "Why we built The Coworking Dispatch: India-first coworking news, member reviews, and a transparent weekly ranking." },
      { property: "og:title", content: "About The Coworking Dispatch" },
      { property: "og:description", content: "India-first coworking news, member reviews, and a transparent weekly ranking." },
    ],
    links: [canonicalLink("/about")],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeading eyebrow="About" title="The pulse of India's coworking scene." />
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        The Coworking Dispatch is a news, review, and community site built around one idea: coworking in India
        gets talked about constantly, but it's scattered across brand blogs, city Facebook groups, and word of
        mouth. We pull it into one place.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6 hover-glow hover:hover-glow-hover">
          <Newspaper className="h-5 w-5" />
          <h2 className="mt-3 font-display text-xl">Real news, aggregated</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our wire pulls from hundreds of publishers covering office space, coworking, and flexible workspace
            across India and the world, not just a handful of company blogs.
          </p>
        </div>
        <div className="glass rounded-2xl p-6 hover-glow hover:hover-glow-hover">
          <Star className="h-5 w-5" />
          <h2 className="mt-3 font-display text-xl">Open to every coworker</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every space listing has a real name, address, and price sourced from public coworking directories.
            Anyone who's actually worked out of a space can <Link to="/spaces" className="acid-underline hover:acid-underline-hover font-medium text-foreground">sign in and leave a review</Link>.
          </p>
        </div>
        <div className="glass rounded-2xl p-6 hover-glow hover:hover-glow-hover">
          <Trophy className="h-5 w-5" />
          <h2 className="mt-3 font-display text-xl">A transparent ranking</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our weekly <Link to="/winners" className="acid-underline hover:acid-underline-hover font-medium text-foreground">Best Value ranking</Link> isn't paid placement and doesn't need reviews, it's arithmetic on price and amenities against same-city peers, formula published in full.
          </p>
        </div>
        <div className="glass rounded-2xl p-6 hover-glow hover:hover-glow-hover">
          <MessagesSquare className="h-5 w-5" />
          <h2 className="mt-3 font-display text-xl">A place to actually ask</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our Q&A exists so you can ask the questions a salesperson won't volunteer, before you sign a lease
            you'll regret.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-flare p-6 text-flare-ink md:p-8">
        <h2 className="font-display text-2xl">70% India, 30% the rest of the world</h2>
        <p className="mt-2 text-sm opacity-80 leading-relaxed">
          We're India-first by design. Roughly 70% of what you'll see here, spaces, dispatches, and Q&A, is
          about India's coworking scene. The other 30% covers what's happening globally, because founders here
          care what's happening in Lisbon, Berlin, or Singapore too.
        </p>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Questions, feedback, or found something that doesn't look right? <Link to="/contact" className="acid-underline hover:acid-underline-hover font-medium text-foreground">Get in touch</Link>.
      </p>
    </div>
  );
}
