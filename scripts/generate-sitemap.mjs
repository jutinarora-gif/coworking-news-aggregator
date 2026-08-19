import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE_URL = "https://www.coworkingdispatch.com";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      const [, key, rawValue] = match;
      const value = rawValue.replace(/^"(.*)"$/, "$1");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}
loadDotEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

async function main() {
  const staticUrls = [
    "", "/dispatches", "/spaces", "/winners", "/questions", "/about", "/contact", "/terms", "/privacy",
    "/careers", "/guides",
    "/guides/how-to-choose-a-coworking-space",
    "/guides/coworking-vs-traditional-office-cost-breakdown",
    "/guides/gst-registration-virtual-offices-guide",
    "/guides/getting-your-first-reviews",
    "/guides/community-management-101",
    "/guides/red-flags-before-you-sign-a-coworking-contract",
    "/guides/coworking-etiquette-unwritten-rules",
    "/guides/pricing-your-coworking-space",
    "/guides/what-members-actually-complain-about",
    "/guides/marketing-your-space-without-paid-ads",
    "/guides/handling-a-bad-review-the-right-way",
    "/blog",
    "/blog/6-coworking-red-flags-we-see-again-and-again",
    "/blog/monthly-coworking-membership-can-you-cancel-anytime",
    "/blog/how-should-a-startup-choose-between-coworking-and-a-managed-office",
    "/blog/best-coworking-space-for-a-startup-team-in-india",
  ];
  let dynamicUrls = [];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    // PostgREST caps an unbounded select() at 1000 rows, so paginate through
    // everything rather than silently truncating the sitemap.
    async function fetchAllSlugs(table, filterColumn, filterValue) {
      const pageSize = 1000;
      let from = 0;
      const slugs = [];
      while (true) {
        const { data, error } = await supabase
          .from(table)
          .select("slug")
          .eq(filterColumn, filterValue)
          .range(from, from + pageSize - 1);
        if (error) {
          console.error(`[sitemap] Failed to fetch ${table}:`, error.message);
          break;
        }
        slugs.push(...(data ?? []).map((r) => r.slug));
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return slugs;
    }

    // Individual dispatch pages are noindexed (thin, aggregated wire
    // content) -- leaving them out of the sitemap keeps it aligned with
    // what's actually indexable. The /dispatches hub page itself is still
    // indexable and listed in staticUrls above.
    const spaceSlugs = await fetchAllSlugs("spaces", "is_published", true);
    dynamicUrls = spaceSlugs.map((slug) => `/spaces/${slug}`);
  } else {
    console.warn("[sitemap] Missing SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY, generating static-only sitemap");
  }

  const allUrls = [...staticUrls, ...dynamicUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `<url><loc>${BASE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`;

  writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), xml);
  console.log(`[sitemap] Wrote ${allUrls.length} URLs to public/sitemap.xml`);
}

main().catch((err) => {
  console.error("[sitemap] Failed to generate:", err);
  process.exit(1);
});
