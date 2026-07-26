import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDispatch } from "@/lib/data.functions";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, ArrowLeft } from "lucide-react";

const q = (slug: string) => queryOptions({ queryKey: ["dispatch", slug], queryFn: () => getDispatch({ data: { slug } }) });

export const Route = createFileRoute("/dispatches/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(q(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} , The Coworking Dispatch` },
      { name: "description", content: loaderData.excerpt ?? "A dispatch from The Coworking Dispatch." },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.excerpt ?? "" },
      ...(loaderData.cover_url ? [{ property: "og:image", content: loaderData.cover_url }, { name: "twitter:image", content: loaderData.cover_url }] : []),
    ] : [{ title: "Dispatch" }],
    links: loaderData?.source_url ? [{ rel: "canonical", href: loaderData.source_url }] : [],
  }),
  component: DispatchPage,
  notFoundComponent: () => <div className="p-16 text-center">Dispatch not found</div>,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function DispatchPage() {
  const { slug } = Route.useParams();
  const { data: d } = useSuspenseQuery(q(slug));
  if (!d) return null;
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/dispatches" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Back to dispatches</Link>
      <div className="mt-6 text-xs uppercase tracking-widest text-iris">{d.source_name} · {formatDistanceToNow(new Date(d.published_at), { addSuffix: true })}</div>
      <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{d.title}</h1>
      {d.cover_url && (
        <div className="mt-8 rounded-2xl overflow-hidden aspect-[16/9]">
          <img src={d.cover_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {d.excerpt && <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{d.excerpt}</p>}
      {d.body_md && <div className="mt-6 prose prose-invert max-w-none whitespace-pre-wrap">{d.body_md}</div>}
      {d.source_url && (
        <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-iris text-primary-foreground font-medium">
          Read on {d.source_name} <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {d.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {d.tags.map((t: string) => <span key={t} className="text-xs px-2 py-1 rounded-full border border-border">{t}</span>)}
        </div>
      )}
    </article>
  );
}
