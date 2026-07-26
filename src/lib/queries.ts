import { supabase } from "@/lib/supabase";
import type { CoworkingSpace } from "@/lib/types";

export type ArticleWithMeta = {
  id: string;
  title: string;
  link: string;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
  locations: { country: string; city: string | null; slug: string; image_url: string | null } | null;
  feed_sources: { category: "local" | "coworking_industry"; name: string } | null;
};

const ARTICLE_SELECT = "id, title, link, summary, image_url, published_at, locations(country, city, slug, image_url), feed_sources(category, name)";
const ARTICLE_SELECT_INNER = "id, title, link, summary, image_url, published_at, locations(country, city, slug, image_url), feed_sources!inner(category, name)";

export async function getFeaturedArticle() {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle<ArticleWithMeta>();
  return data;
}

export async function getTickerArticles(limit = 12) {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<ArticleWithMeta[]>();
  return data ?? [];
}

export async function getLocalArticles(limit = 20) {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT_INNER)
    .eq("feed_sources.category", "local")
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<ArticleWithMeta[]>();
  return data ?? [];
}

export async function getCoworkingArticles(limit = 30) {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT_INNER)
    .eq("feed_sources.category", "coworking_industry")
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<ArticleWithMeta[]>();
  return data ?? [];
}

export async function getSpacesByLocationSlug(citySlug: string) {
  const { data: location } = await supabase.from("locations").select("*").eq("slug", citySlug).single();
  if (!location) return { location: null, spaces: [] };

  const { data: spaces } = await supabase
    .from("coworking_spaces")
    .select("*")
    .eq("location_id", location.id)
    .order("name")
    .returns<CoworkingSpace[]>();

  return { location, spaces: spaces ?? [] };
}

export async function getSpaceBySlug(spaceSlug: string) {
  const { data } = await supabase
    .from("coworking_spaces")
    .select("*, locations(country, city, slug)")
    .eq("slug", spaceSlug)
    .single();
  return data as (CoworkingSpace & { locations: { country: string; city: string | null; slug: string } | null }) | null;
}

export async function getSpacesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("coworking_spaces")
    .select("*, locations(country, city, slug)")
    .in("id", ids)
    .returns<(CoworkingSpace & { locations: { country: string; city: string | null; slug: string } | null })[]>();
  return data ?? [];
}

export async function getSpaceCitiesWithCounts() {
  const { data } = await supabase
    .from("locations")
    .select("id, country, city, slug, image_url, coworking_spaces(count)")
    .eq("country", "India");
  return (
    (data as unknown as {
      id: string;
      country: string;
      city: string | null;
      slug: string;
      image_url: string | null;
      coworking_spaces: { count: number }[];
    }[]) ?? []
  )
    .map((loc) => ({ ...loc, spaceCount: loc.coworking_spaces?.[0]?.count ?? 0 }))
    .filter((loc) => loc.spaceCount > 0);
}

export async function getLocationArticleCounts() {
  const { data } = await supabase.from("locations").select("id, country, city, slug, image_url, articles(count)");
  return (
    (data as unknown as {
      id: string;
      country: string;
      city: string | null;
      slug: string;
      image_url: string | null;
      articles: { count: number }[];
    }[]) ?? []
  ).map((loc) => ({ ...loc, articleCount: loc.articles?.[0]?.count ?? 0 }));
}
