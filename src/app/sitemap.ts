import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.coworkingdispatch.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: locations } = await supabase.from("locations").select("slug");
  const { data: spaces } = await supabase
    .from("coworking_spaces")
    .select("slug, locations(slug)");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/coworking`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/spaces`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const countryRoutes: MetadataRoute.Sitemap = (locations ?? []).map((loc) => ({
    url: `${BASE_URL}/country/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const citySpaceSlugs = new Set(
    (spaces ?? [])
      .map((s) => (s.locations as unknown as { slug: string } | null)?.slug)
      .filter(Boolean) as string[]
  );
  const citySpaceRoutes: MetadataRoute.Sitemap = Array.from(citySpaceSlugs).map((slug) => ({
    url: `${BASE_URL}/spaces/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const spaceRoutes: MetadataRoute.Sitemap = (spaces ?? [])
    .filter((s) => (s.locations as unknown as { slug: string } | null)?.slug)
    .map((s) => ({
      url: `${BASE_URL}/spaces/${(s.locations as unknown as { slug: string }).slug}/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...countryRoutes, ...citySpaceRoutes, ...spaceRoutes];
}
