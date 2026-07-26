import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { fetchFeed } from "@/lib/rss";
import type { FeedSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getServiceClient();

  const { data: sources, error } = await db.from("feed_sources").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let inserted = 0;
  const errors: string[] = [];

  for (const source of (sources ?? []) as FeedSource[]) {
    try {
      const items = await fetchFeed(source.url);
      if (items.length === 0) continue;

      const rows = items.map((item) => ({
        feed_source_id: source.id,
        location_id: source.location_id,
        title: item.title,
        link: item.link,
        summary: item.summary,
        image_url: item.image_url,
        published_at: item.published_at,
      }));

      const { error: upsertError, count } = await db
        .from("articles")
        .upsert(rows, { onConflict: "link", ignoreDuplicates: true, count: "exact" });

      if (upsertError) {
        errors.push(`${source.name}: ${upsertError.message}`);
      } else {
        inserted += count ?? 0;
      }
    } catch (err) {
      errors.push(`${source.name}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ sourcesProcessed: sources?.length ?? 0, inserted, errors });
}
