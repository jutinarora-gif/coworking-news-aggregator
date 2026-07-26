import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { fetchFeed } from "@/lib/rss";
import { isRelevant, normalizeTitle } from "@/lib/relevance";
import type { FeedSource } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEDUP_WINDOW_DAYS = 14;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();

  const { data: sources, error } = await db.from("feed_sources").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const since = new Date(Date.now() - DEDUP_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentArticles } = await db
    .from("articles")
    .select("title")
    .gte("fetched_at", since);
  const seenTitles = new Set((recentArticles ?? []).map((a) => normalizeTitle(a.title)));

  let inserted = 0;
  let skippedIrrelevant = 0;
  let skippedDuplicate = 0;
  const errors: string[] = [];

  for (const source of (sources ?? []) as FeedSource[]) {
    try {
      const items = await fetchFeed(source.url);
      if (items.length === 0) continue;

      const rows = [];
      for (const item of items) {
        if (!isRelevant(item.title, item.summary)) {
          skippedIrrelevant++;
          continue;
        }
        const normalized = normalizeTitle(item.title);
        if (seenTitles.has(normalized)) {
          skippedDuplicate++;
          continue;
        }
        seenTitles.add(normalized);
        rows.push({
          feed_source_id: source.id,
          location_id: source.location_id,
          title: item.title,
          link: item.link,
          summary: item.summary,
          image_url: item.image_url,
          published_at: item.published_at,
        });
      }

      if (rows.length === 0) continue;

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

  return NextResponse.json({
    sourcesProcessed: sources?.length ?? 0,
    inserted,
    skippedIrrelevant,
    skippedDuplicate,
    errors,
  });
}
