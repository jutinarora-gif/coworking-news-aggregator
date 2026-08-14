import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Mail } from "lucide-react";
import { PageHeading } from "@/components/site/page-heading";
import { Button } from "@/components/ui/button";
import { canonicalLink } from "@/lib/seo";
import { ALL_POSTS_META, WRITTEN_POSTS } from "@/content/blog/registry";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog , The Coworking Dispatch" },
      { name: "description", content: "Long reads on coworking in India and beyond. Pricing games, community myths, desk economics, and what members actually experience." },
      { property: "og:title", content: "The Coworking Dispatch Blog" },
      { property: "og:description", content: "Essays and field notes on coworking, written from the desks. India first, world second." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/blog")],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [lead, ...rest] = ALL_POSTS_META;
  const leadWritten = WRITTEN_POSTS.has(lead.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <PageHeading
        eyebrow="Long reads"
        icon={<BookOpen className="h-3.5 w-3.5" />}
        title="Blog"
        sub="Essays and field notes from the desks. Slower than the wire, sharper than a press release."
        right={
          <Button asChild variant="mint" className="rounded-full">
            <a href="mailto:hello@coworkingdispatch.com?subject=Blog%20pitch">
              <Mail className="mr-1 h-4 w-4" /> Pitch a story
            </a>
          </Button>
        }
      />

      <LeadCard post={lead} written={leadWritten} />

      <section className="mt-12">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />
          Latest posts
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => {
            const written = WRITTEN_POSTS.has(p.slug);
            const card = (
              <article className="glass h-full rounded-2xl p-6 hover-glow hover:hover-glow-hover">
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-full border border-border px-2.5 py-0.5">{p.category}</span>
                  {written && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.read}
                    </span>
                  )}
                  {!written && <span className="rounded-full bg-muted px-2.5 py-0.5">Coming soon</span>}
                </div>
                <h3 className="mt-4 font-display text-2xl leading-tight">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.excerpt}</p>
                {written && <div className="mt-5 text-[11px] uppercase tracking-widest text-muted-foreground">{p.date}</div>}
              </article>
            );
            return written ? (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }}>{card}</Link>
            ) : (
              <div key={p.slug} className="opacity-60">{card}</div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl rounded-3xl bg-flare p-8 text-flare-ink sm:p-10">
        <h2 className="font-display text-3xl sm:text-4xl">One long read, every Wednesday.</h2>
        <p className="mt-3 max-w-2xl text-sm opacity-80">
          No roundups you can get anywhere else. Just the story behind the desks, in your inbox.
        </p>
        <Button asChild className="mt-6 rounded-full bg-flare-ink text-flare hover:opacity-90">
          <a href="mailto:hello@coworkingdispatch.com?subject=Subscribe">Subscribe</a>
        </Button>
      </section>
    </div>
  );
}

function LeadCard({ post, written }: { post: (typeof ALL_POSTS_META)[number]; written: boolean }) {
  const inner = (
    <article className="mt-12 overflow-hidden rounded-3xl border-2 border-flare p-8 sm:p-10 transition-transform hover:translate-y-[-2px]">
      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest">
        <span className="rounded-full bg-flare px-3 py-1 text-flare-ink">Featured</span>
        <span className="text-muted-foreground">{post.category}</span>
        {written && <span className="text-muted-foreground">{post.date}</span>}
        {written && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.read}
          </span>
        )}
      </div>
      <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] sm:text-5xl">{post.title}</h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">{post.excerpt}</p>
      {written && (
        <span className="mt-6 inline-block text-sm font-medium hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">
          Read the story
        </span>
      )}
    </article>
  );
  return written ? <Link to="/blog/$slug" params={{ slug: post.slug }}>{inner}</Link> : inner;
}
