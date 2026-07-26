import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import {
  getFeaturedArticle,
  getTickerArticles,
  getLocalArticles,
  getCoworkingArticles,
  getLocationArticleCounts,
  getFeaturedSpace,
} from "@/lib/queries";
import { Hero } from "@/components/site/Hero";
import { SpaceOfTheWeek } from "@/components/site/SpaceOfTheWeek";
import { Ticker } from "@/components/site/Ticker";
import { NewsFeed } from "@/components/site/NewsFeed";
import { CitySpotlight } from "@/components/site/CitySpotlight";
import { SalespersonQuestions } from "@/components/site/SalespersonQuestions";
import { Etiquette } from "@/components/site/Etiquette";
import { RemoteWorkTips } from "@/components/site/RemoteWorkTips";
import { Subscribe } from "@/components/site/Subscribe";

export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [featured, ticker, local, coworking, locations, { count: totalArticles }, featuredSpace] = await Promise.all([
    getFeaturedArticle(),
    getTickerArticles(),
    getLocalArticles(),
    getCoworkingArticles(6),
    getLocationArticleCounts(),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    getFeaturedSpace(),
  ]);

  const feedArticles = [...local, ...coworking].sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <main className="flex-1">
      <Hero featured={featured} totalArticles={totalArticles ?? 0} totalLocations={locations.length} />
      <SpaceOfTheWeek space={featuredSpace} />
      <Ticker articles={ticker} />
      <NewsFeed articles={feedArticles} />
      <CitySpotlight locations={locations} />
      <SalespersonQuestions />
      <Etiquette />
      <RemoteWorkTips />
      <Subscribe />
    </main>
  );
}
