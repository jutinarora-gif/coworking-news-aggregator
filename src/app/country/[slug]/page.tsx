import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ArticleWithMeta } from "@/lib/queries";
import { NewsFeed } from "@/components/site/NewsFeed";
import type { Location } from "@/lib/types";

export const revalidate = 1800;

const ARTICLE_SELECT =
  "id, title, link, summary, image_url, published_at, locations(country, city, slug), feed_sources(category, name)";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single<Location>();

  if (!location) notFound();

  const { data: articles } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("location_id", location.id)
    .order("published_at", { ascending: false })
    .limit(30)
    .returns<ArticleWithMeta[]>();

  const place = location.city ? `${location.city}, ${location.country}` : location.country;

  return (
    <main className="flex-1">
      <NewsFeed
        articles={articles ?? []}
        kicker="City File"
        heading={<>{place}</>}
        description={`Local news aggregated for ${place}.`}
        showFilters={false}
      />
    </main>
  );
}
