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
  // Broader business/real-estate terms so general news outlets (Inc42, ET
  // Startups, Times of India, Hindustan Times) can qualify too, not just
  // brand blogs that are inherently 100% on-topic.
  "office lease", "office leasing", "office rent", "office demand", "office absorption",
  "commercial property", "corporate real estate", "grade-a office", "grade a office",
  "business park", "tech park", "it park", "serviced office", "business center",
  "business centre", "return to office", "rto mandate", "office attendance",
  "startup funding office", "office culture", "workplace trends", "future of work",
  "office leasing market", "sq ft office", "office space demand",
];

function isRelevant(title, contentSnippet) {
  const text = `${title ?? ""} ${contentSnippet ?? ""}`.toLowerCase();
  return RELEVANCE_KEYWORDS.some((kw) => text.includes(kw));
}

// Most RSS feeds don't include a usable cover image, so we pin a random
// coworking-relevant stock photo per article rather than ship a text-only card.
const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200",
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1200",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200",
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200",
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=1200",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
  "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1200",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
];

function pickCover(item) {
  const fromEnclosure = item.enclosure?.url;
  if (fromEnclosure && /\.(jpe?g|png|webp)$/i.test(fromEnclosure)) return fromEnclosure;
  return FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];
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
        cover_url: pickCover(item),
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
