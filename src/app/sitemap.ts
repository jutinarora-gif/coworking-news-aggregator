import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://coworkingdispatch.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: locations } = await supabase.from("locations").select("slug");

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
  ];

  const countryRoutes: MetadataRoute.Sitemap = (locations ?? []).map((loc) => ({
    url: `${BASE_URL}/country/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...countryRoutes];
}
