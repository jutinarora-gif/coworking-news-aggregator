import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// "Best value" replaces the old rating-derived leaderboard with pure
// arithmetic on the directory: no reviews, no opinions.
//
// For each city with at least MIN_CITY_SAMPLE priced spaces, every space
// gets two percentile scores relative to its own city peers (comparing
// within a city, not across India, so a cheap tier-2-city space doesn't
// automatically beat a metro space just for being in a cheaper market):
//   - price percentile: beats what fraction of same-city spaces on price
//     (cheapest = 100, priciest = 0)
//   - amenity percentile: beats what fraction of same-city spaces on
//     amenity count (most amenities = 100, fewest = 0)
// value_score = 65% price percentile + 35% amenity percentile
//
// Cities below MIN_CITY_SAMPLE are excluded entirely - a lone space in a
// city has no peers to be "better value" than, and would trivially score
// 100.
const PRICE_WEIGHT = 0.65;
const AMENITY_WEIGHT = 0.35;
const MIN_CITY_SAMPLE = 3;
const TOP_N = 20;

function percentileScores(values) {
  // Higher raw value -> higher percentile. Ties get the *average* of the
  // ranks they span (the standard "average rank" method), not the top of
  // the tied group - otherwise every space tied at a city's most common
  // value (e.g. the modal amenity count) would incorrectly score 100.
  const n = values.length;
  if (n <= 1) return values.map(() => 100);
  const sorted = [...values].sort((a, b) => a - b);
  return values.map((v) => {
    const firstIdx = sorted.findIndex((x) => x === v);
    const lastIdx = sorted.length - 1 - [...sorted].reverse().findIndex((x) => x === v);
    const avgRank = (firstIdx + lastIdx) / 2;
    return (avgRank / (n - 1)) * 100;
  });
}

async function main() {
  const [{ data: spaces, error }, { data: cities, error: citiesError }] = await Promise.all([
    supabase.from("spaces").select("id,price_from,amenities,city_id").eq("is_published", true).not("price_from", "is", null),
    supabase.from("cities").select("id,region"),
  ]);
  if (error) throw error;
  if (citiesError) throw citiesError;
  const regionByCity = new Map((cities ?? []).map((c) => [c.id, c.region]));

  const byCity = new Map();
  for (const s of spaces) {
    const list = byCity.get(s.city_id) ?? [];
    list.push(s);
    byCity.set(s.city_id, list);
  }

  // Scored per-region rather than one global top N: ranking India and
  // global spaces against each other in one list would let a handful of
  // very cheap global spaces (small samples, thin markets) crowd out
  // India spaces entirely - the site defaults to an India view, which
  // needs its own top N, not whatever survives a mixed cut.
  const scoredByRegion = new Map();
  for (const [cityId, citySpaces] of byCity) {
    if (citySpaces.length < MIN_CITY_SAMPLE) continue;

    // Cheapest should score highest, so invert price before ranking:
    // negate it and reuse the same "higher is better" percentile logic.
    const pricePercentiles = percentileScores(citySpaces.map((s) => -s.price_from));
    const amenityPercentiles = percentileScores(citySpaces.map((s) => (s.amenities ?? []).length));

    const region = regionByCity.get(cityId) ?? "global";
    const list = scoredByRegion.get(region) ?? [];
    citySpaces.forEach((s, i) => {
      const value_score = PRICE_WEIGHT * pricePercentiles[i] + AMENITY_WEIGHT * amenityPercentiles[i];
      list.push({ space_id: s.id, value_score });
    });
    scoredByRegion.set(region, list);
  }

  // Monday of the current week, UTC.
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday));
  const week_start = monday.toISOString().slice(0, 10);

  const rows = [];
  let totalEligible = 0;
  for (const [region, list] of scoredByRegion) {
    totalEligible += list.length;
    list.sort((a, b) => b.value_score - a.value_score);
    list.slice(0, TOP_N).forEach((w, i) => {
      rows.push({
        week_start,
        space_id: w.space_id,
        rank: i + 1,
        score: Number(w.value_score.toFixed(1)),
      });
    });
  }

  const { error: upsertError } = await supabase
    .from("weekly_winners")
    .upsert(rows, { onConflict: "week_start,space_id" });
  if (upsertError) throw upsertError;

  console.log(`Computed value scores for ${totalEligible} eligible spaces across ${byCity.size} cities.`);
  console.log(`Wrote ${rows.length} rows (top ${TOP_N} per region) for week_start=${week_start}.`);
  console.table(rows.slice(0, 10));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
