import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Mail } from "lucide-react";
import { PageHeading } from "@/components/site/page-heading";
import { Button } from "@/components/ui/button";
import { canonicalLink } from "@/lib/seo";

type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  excerpt: string;
  featured?: boolean;
  image: string;
};

const posts: Post[] = [
  {
    slug: "the-real-cost-of-a-hot-desk-in-bengaluru",
    title: "The real cost of a hot desk in Bengaluru",
    category: "Economics",
    date: "Aug 4, 2026",
    read: "8 min",
    excerpt:
      "Listed price is the opening bid. We added up lock ins, printing, meeting room credits and the coffee upsell across 12 spaces to find what a desk actually costs a founder per month.",
    featured: true,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "community-is-a-feature-not-a-poster",
    title: "Community is a feature, not a poster",
    category: "Culture",
    date: "Jul 29, 2026",
    read: "6 min",
    excerpt:
      "Every space sells community. Only a handful staff it. Here is how to tell the difference in one walkthrough, before you sign anything.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "wifi-that-survives-a-demo-day",
    title: "Wifi that survives a demo day",
    category: "Field notes",
    date: "Jul 22, 2026",
    read: "5 min",
    excerpt:
      "We ran speed tests at peak hours across Mumbai and Gurugram. The gap between the marketing number and the 4pm number is the whole story.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "why-tier-two-cities-are-winning-the-flex-race",
    title: "Why tier two cities are winning the flex race",
    category: "India desk",
    date: "Jul 15, 2026",
    read: "9 min",
    excerpt:
      "Indore, Kochi and Jaipur are adding desks faster than they are adding traffic. Operators there are building for locals, not for headlines.",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "the-quiet-floor-problem",
    title: "The quiet floor problem",
    category: "Design",
    date: "Jul 8, 2026",
    read: "4 min",
    excerpt:
      "Open plans sell tours and ruin afternoons. A short argument for acoustic zoning, and the three spaces that already got it right.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "what-global-operators-keep-getting-wrong-in-india",
    title: "What global operators keep getting wrong in India",
    category: "Global",
    date: "Jul 1, 2026",
    read: "7 min",
    excerpt:
      "Imported playbooks, imported pricing, imported furniture. The 30 percent of the world we cover has plenty to learn from the 70 percent.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
  },
];

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  head: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    return {
      meta: [
        { title: post ? `${post.title} , The Coworking Dispatch` : "Post , The Coworking Dispatch" },
        { name: "description", content: post?.excerpt ?? "A long read from The Coworking Dispatch." },
        { property: "og:title", content: post?.title ?? "The Coworking Dispatch" },
        { property: "og:description", content: post?.excerpt ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonicalLink(`/blog/${params.slug}`)],
    };
  },
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post, related: posts.filter((p) => p.slug !== post.slug).slice(0, 2) };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, related } = Route.useLoaderData() as { post: Post; related: Post[] };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest">
          <span className="rounded-full bg-flare px-3 py-1 text-flare-ink">{post.category}</span>
          <span className="text-muted-foreground">{post.date}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.read}
          </span>
        </div>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{post.excerpt}</p>
      </header>

      <figure className="mt-10 overflow-hidden rounded-3xl">
        <img src={post.image} alt={post.title} className="h-64 w-full object-cover sm:h-80 lg:h-96" />
      </figure>

      <article className="prose prose-lg mt-12 max-w-none">
        <p className="font-display text-xl leading-relaxed">
          This is a template paragraph. Replace it with the actual story body. The design keeps the reader focused:
          warm paper background, near-black ink, and a single mint accent for category tags, pull quotes, and links.
        </p>

        <h2 className="font-display text-2xl">A section heading in the article</h2>
        <p>
          Use this route as a blueprint. Duplicate it for each long read, swap the slug, title, image, and body copy.
          The layout is built to scale from a 4 minute field note to a 4,000 word investigation.
        </p>

        <blockquote className="border-l-4 border-flare pl-5 font-display text-2xl italic leading-snug text-foreground">
          "Pull quotes can sit inside a mint left border. They break the rhythm without breaking the design."
        </blockquote>

        <p>
          Keep paragraphs short. Use subheadings generously. The Coworking Dispatch reads best when it feels like a
          printed magazine that happens to scroll.
        </p>

        <h2 className="font-display text-2xl">Another section heading</h2>
        <p>
          Add more sections, embed images, charts, or member quotes. The container is max-w-3xl so the line length
          stays comfortable on every screen.
        </p>
      </article>

      <div className="mt-12 flex items-center gap-4 border-t border-border pt-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-flare text-flare-ink font-display font-bold">
          TCD
        </div>
        <div>
          <div className="font-display font-medium">The Coworking Dispatch</div>
          <div className="text-sm text-muted-foreground">Reported from the desks.</div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <PageHeading eyebrow="Read next" title="More long reads" sub="" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {related.map((p: Post) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group glass rounded-2xl p-5 hover-glow hover:hover-glow-hover"
              >
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</div>
                <h3 className="mt-2 font-display text-xl leading-tight group-hover:underline group-hover:decoration-[var(--flare)] group-hover:decoration-2 group-hover:underline-offset-4">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 rounded-3xl bg-flare p-8 text-flare-ink sm:p-10">
        <h2 className="font-display text-3xl">One long read, every Wednesday.</h2>
        <p className="mt-3 max-w-xl text-sm opacity-80">
          Get the story behind the desks in your inbox. No roundups, no press releases.
        </p>
        <Button asChild className="mt-6 rounded-full bg-flare-ink text-flare hover:opacity-90">
          <a href="mailto:hello@coworkingdispatch.com?subject=Subscribe">
            <Mail className="mr-1 h-4 w-4" /> Subscribe
          </a>
        </Button>
      </section>
    </div>
  );
}
