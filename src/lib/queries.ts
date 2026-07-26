import { supabase } from "@/lib/supabase";

export type ArticleWithMeta = {
  id: string;
  title: string;
  link: string;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
  locations: { country: string; city: string | null; slug: string } | null;
  feed_sources: { category: "local" | "coworking_industry"; name: string } | null;
};

const ARTICLE_SELECT = "id, title, link, summary, image_url, published_at, locations(country, city, slug), feed_sources(category, name)";

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
    .select(ARTICLE_SELECT + ", feed_sources!inner(category, name)")
    .eq("feed_sources.category", "local")
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<ArticleWithMeta[]>();
  return data ?? [];
}

export async function getCoworkingArticles(limit = 30) {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT + ", feed_sources!inner(category, name)")
    .eq("feed_sources.category", "coworking_industry")
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<ArticleWithMeta[]>();
  return data ?? [];
}

export async function getLocationArticleCounts() {
  const { data } = await supabase.from("locations").select("id, country, city, slug, articles(count)");
  return (
    (data as unknown as {
      id: string;
      country: string;
      city: string | null;
      slug: string;
      articles: { count: number }[];
    }[]) ?? []
  ).map((loc) => ({ ...loc, articleCount: loc.articles?.[0]?.count ?? 0 }));
}
