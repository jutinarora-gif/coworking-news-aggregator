import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const parser = new Parser({ timeout: 15000 });

const RELEVANCE_KEYWORDS = [
  "coworking", "co-working", "flexible workspace", "flex space", "shared office",
  "managed office", "remote work", "hybrid work", "wfh", "startup office",
  "office space", "commercial real estate", "workspace", "hot desk", "hotdesk",
  "wework", "awfis", "91springboard", "smartworks", "bhive", "cowrks", "indiqube",
];

function isRelevant(title, contentSnippet) {
  const text = `${title ?? ""} ${contentSnippet ?? ""}`.toLowerCase();
  return RELEVANCE_KEYWORDS.some((kw) => text.includes(kw));
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

async function ingestFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const items = parsed.items ?? [];
    let inserted = 0;
    let skipped = 0;

    for (const item of items) {
      const guid = item.guid || item.link;
      if (!guid) continue;

      if (!isRelevant(item.title, item.contentSnippet)) {
        skipped++;
        continue;
      }

      const { data: existing } = await supabase
        .from("dispatches")
        .select("id")
        .eq("feed_id", feed.id)
        .eq("guid", guid)
        .maybeSingle();
      if (existing) continue;

      const title = item.title?.trim() || "Untitled";
      const slug = slugify(`${title}-${feed.source_site}`);
      const excerpt = (item.contentSnippet || item.summary || "").slice(0, 280);

      const { error: insErr } = await supabase.from("dispatches").insert({
        slug,
        feed_id: feed.id,
        source_type: "rss",
        guid,
        title,
        excerpt,
        body_md: null,
        cover_url: null,
        source_url: item.link || null,
        source_name: feed.name,
        region: feed.region,
        published_at: item.isoDate || item.pubDate || new Date().toISOString(),
        ingested_at: new Date().toISOString(),
        is_hidden: false,
        is_featured: false,
      });

      if (insErr) {
        if (insErr.code === "23505") continue; // duplicate guid, race-safe
        console.error(`  insert error for "${title}":`, insErr.message);
        continue;
      }
      inserted++;
    }

    await supabase
      .from("feeds")
      .update({ last_polled_at: new Date().toISOString(), last_status: "ok" })
      .eq("id", feed.id);

    console.log(`${feed.name}: ${inserted} inserted, ${skipped} skipped (irrelevant), ${items.length} total items`);
  } catch (err) {
    console.error(`${feed.name}: FAILED — ${err.message}`);
    await supabase
      .from("feeds")
      .update({ last_polled_at: new Date().toISOString(), last_status: `error: ${err.message}`.slice(0, 200) })
      .eq("id", feed.id);
  }
}

async function main() {
  const { data: feeds, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("is_active", true)
    .eq("approved", true);

  if (error) {
    console.error("Failed to load feeds:", error.message);
    process.exit(1);
  }

  console.log(`Polling ${feeds.length} feeds...`);
  for (const feed of feeds) {
    await ingestFeed(feed);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
