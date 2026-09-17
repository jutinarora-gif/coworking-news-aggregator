// Rewrites templated space descriptions that were built from a small pool
// of interchangeable sentences (name/city/area swapped, wording identical).
// Google flagged ~169 of these as "crawled, currently not indexed" - this
// generates a genuinely differentiated description per space by weaving in
// real, per-listing facts (specific amenities, actual price vs. the city
// median, vibe tags) through varied sentence structures, instead of
// recombining a handful of fixed templates.
//
// Usage: node scripts/regenerate-space-descriptions.mjs [--dry-run]

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DRY_RUN = process.argv.includes("--dry-run");

const TEMPLATE_MARKERS = [
  "meeting rooms that are actually bookable.",
  "outgrew home offices but aren't ready for a long lease.",
  "easy access for daily commuters.",
  "Looking for shared office space in",
  "runs a coworking space aimed at founders",
  "is worth a look for its mix of hot desks and private cabins",
  "is one of the more practical options for coworking",
];

function isTemplated(description) {
  return TEMPLATE_MARKERS.some((m) => (description || "").includes(m));
}

// Deterministic pseudo-random pick per slug, so re-runs are stable instead
// of reshuffling every listing's description on every run.
function pick(list, seedStr, salt) {
  let h = 0;
  const s = seedStr + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

function amenityPhrase(amenities) {
  if (!amenities || amenities.length === 0) return null;
  const list = amenities.slice(0, 3).map((a) => a.toLowerCase());
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list[0]}, ${list[1]}, and ${list[2]}`;
}

function priceContext(priceFrom, cityMedian) {
  if (!priceFrom || !cityMedian) return null;
  const diffPct = Math.round(((priceFrom - cityMedian) / cityMedian) * 100);
  if (diffPct <= -15) return "priced well under the city median";
  if (diffPct >= 15) return "priced above the city median";
  return "priced close to the city median";
}

function buildDescription({ name, cityName, area, amenities, vibeTags, priceFrom, currency, cityMedian }, slug) {
  const amPhrase = amenityPhrase(amenities);
  const priceNote = priceContext(priceFrom, cityMedian);
  const vibe = vibeTags && vibeTags.length ? vibeTags[0] : null;

  const openers = [
    `${name} sits in ${area}, ${cityName}`,
    `In ${area}, ${cityName}, ${name} operates`,
    `${name} is a coworking space in ${area}, ${cityName}`,
    `Based in ${area}, ${cityName}, ${name} runs a coworking space`,
  ];
  const opener = pick(openers, slug, "opener");

  const facts = [];
  if (amPhrase) facts.push(pick([
    `The listing includes ${amPhrase}.`,
    `On offer: ${amPhrase}.`,
    `Members get ${amPhrase}.`,
  ], slug, "facts"));
  if (priceFrom) facts.push(pick([
    `Hot desks start at ${currency === "INR" ? "₹" : currency + " "}${priceFrom.toLocaleString("en-IN")}/mo${priceNote ? `, ${priceNote} for ${cityName}` : ""}.`,
    `Plans start from ${currency === "INR" ? "₹" : currency + " "}${priceFrom.toLocaleString("en-IN")} a month${priceNote ? `, ${priceNote}` : ""}.`,
  ], slug, "price"));
  if (vibe) facts.push(pick([
    `It leans toward a ${vibe} setup.`,
    `The overall feel here is ${vibe}.`,
  ], slug, "vibe"));

  const closers = [
    `Worth a look if you're comparing options in ${cityName}.`,
    `A reasonable pick for teams narrowing down ${cityName} spaces.`,
    `Check current pricing and photos before you shortlist it.`,
  ];
  const closer = pick(closers, slug, "closer");

  return [`${opener}.`, ...facts, closer].join(" ");
}

async function main() {
  const [{ data: spaces, error }, { data: cities, error: cErr }] = await Promise.all([
    supabase.from("spaces").select("id,slug,name,address,city_id,price_from,currency,amenities,vibe_tags,description").eq("is_published", true).limit(2000),
    supabase.from("cities").select("id,name"),
  ]);
  if (error) throw error;
  if (cErr) throw cErr;
  const cityById = new Map(cities.map((c) => [c.id, c.name]));

  // City median price, for real price-context sentences (only over spaces
  // that actually have a price, same denominator the value-rankings script
  // uses).
  const pricesByCity = new Map();
  for (const s of spaces) {
    if (!s.price_from || !s.city_id) continue;
    const list = pricesByCity.get(s.city_id) ?? [];
    list.push(s.price_from);
    pricesByCity.set(s.city_id, list);
  }
  function median(cityId) {
    const list = pricesByCity.get(cityId);
    if (!list || list.length === 0) return null;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  const affected = spaces.filter((s) => isTemplated(s.description));
  console.log(`${affected.length} of ${spaces.length} published spaces have a templated description.`);

  let updated = 0;
  for (const s of affected) {
    const cityName = cityById.get(s.city_id) ?? "the area";
    const area = s.address ? s.address.split(",")[0].trim() : cityName;
    const newDescription = buildDescription({
      name: s.name,
      cityName,
      area,
      amenities: s.amenities,
      vibeTags: s.vibe_tags,
      priceFrom: s.price_from,
      currency: s.currency || "INR",
      cityMedian: median(s.city_id),
    }, s.slug);

    if (DRY_RUN) {
      console.log(`\n--- ${s.slug} ---\nOLD: ${s.description}\nNEW: ${newDescription}`);
      continue;
    }
    const { error: updErr } = await supabase.from("spaces").update({ description: newDescription }).eq("id", s.id);
    if (updErr) {
      console.error(`Failed to update ${s.slug}:`, updErr.message);
      continue;
    }
    updated++;
  }

  console.log(DRY_RUN ? "\n(dry run - no writes made)" : `\nUpdated ${updated} descriptions.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
