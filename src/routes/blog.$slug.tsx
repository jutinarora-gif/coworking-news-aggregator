import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Mail } from "lucide-react";
import { PageHeading } from "@/components/site/page-heading";
import { Button } from "@/components/ui/button";
import { canonicalLink } from "@/lib/seo";
import { getPost, ALL_POSTS_META, WRITTEN_POSTS } from "@/content/blog/registry";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    const { title, category, date, read, excerpt, metaDescription, image, slug } = post;
    const related = ALL_POSTS_META.filter((p) => p.slug !== slug && WRITTEN_POSTS.has(p.slug)).slice(0, 2);
    return { meta: { title, category, date, read, excerpt, metaDescription, image, slug }, related };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.meta;
    return {
      meta: [
        { title: post ? `${post.title} , The Coworking Dispatch` : "Post , The Coworking Dispatch" },
        { name: "description", content: post?.metaDescription ?? "A long read from The Coworking Dispatch." },
        { property: "og:title", content: post?.title ?? "The Coworking Dispatch" },
        { property: "og:description", content: post?.metaDescription ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: post ? [canonicalLink(`/blog/${post.slug}`)] : [],
    };
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <div className="font-display text-2xl">This one got spiked before it went to print.</div>
      <p className="mt-2 text-sm text-muted-foreground">We can't find that post. It may not be written yet.</p>
      <Link to="/blog" className="mt-5 inline-block px-5 py-2.5 rounded-full bg-flare text-flare-ink font-medium">Back to Blog</Link>
    </div>
  ),
});

function BlogPostPage() {
  const { meta, related } = Route.useLoaderData();
  const post = getPost(meta.slug)!;
  const Body = post.Body;

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
        <Body />
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
            {related.map((p) => (
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
