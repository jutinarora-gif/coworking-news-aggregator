import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ArticleWithMeta } from "@/lib/queries";
import { NewsFeed } from "@/components/site/NewsFeed";
import type { Location } from "@/lib/types";

export const revalidate = 1800;

const ARTICLE_SELECT =
  "id, title, link, summary, image_url, published_at, locations(country, city, slug), feed_sources(category, name)";

async function getLocation(slug: string) {
  const { data } = await supabase.from("locations").select("*").eq("slug", slug).single<Location>();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) return {};

  const place = location.city ? `${location.city}, ${location.country}` : location.country;
  return {
    title: `${place} Coworking News`,
    description: `Coworking and remote-work news aggregated for ${place} — space openings, community trends, and what's changing where remote workers sit down.`,
    alternates: { canonical: `/country/${location.slug}` },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = await getLocation(slug);

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
        description={`Coworking and remote-work news aggregated for ${place}.`}
        showFilters={false}
      />
    </main>
  );
}
