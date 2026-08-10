import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getGuide } from "@/content/guides/registry";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    // Body is a component reference, not serializable data - only pass the
    // plain metadata through the loader. The component itself is re-looked-up
    // client/server side from the (already-imported) registry in GuidePage.
    const { title, dek, category, readMins, slug } = guide;
    return { title, dek, category, readMins, slug };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} , The Coworking Dispatch` },
      { name: "description", content: loaderData.dek },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.dek },
    ] : [{ title: "Guide" }],
    links: loaderData ? [{ rel: "canonical", href: `https://www.coworkingdispatch.com/guides/${loaderData.slug}` }] : [],
  }),
  component: GuidePage,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <div className="font-display text-2xl">This guide wandered off on a coffee run.</div>
      <p className="mt-2 text-sm text-muted-foreground">We can't find that guide. It may have moved, or never came back from the pantry.</p>
      <Link to="/guides" className="mt-5 inline-block px-5 py-2.5 rounded-full bg-flare text-flare-ink font-medium">Back to Guides</Link>
    </div>
  ),
});

function GuidePage() {
  const guide = Route.useLoaderData();
  const Body = getGuide(guide.slug)!.Body;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/guides" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> All guides
      </Link>

      <div className="mt-4 text-xs uppercase tracking-widest text-iris flex items-center gap-1">
        <BookOpen className="h-3.5 w-3.5" /> {guide.category === "coworkers" ? "For coworkers" : "For operators"}
      </div>
      <h1 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{guide.title}</h1>
      <p className="mt-3 text-base text-muted-foreground">{guide.dek}</p>
      <div className="mt-3 text-xs text-muted-foreground">{guide.readMins} min read</div>

      <div className="mt-8 border-t border-border/60 pt-2">
        <Body />
      </div>
    </div>
  );
}
