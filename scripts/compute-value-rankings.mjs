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

// A flat top-N by raw score lets whichever city happens to have the most
// listings (currently NCR + Hyderabad, from the bulk import) dominate the
// whole India board, since more listings means more shots at a near-100
// percentile. Cap how many slots any single city can take so the board
// actually reflects "all over India," not just wherever we scraped deepest.
const MAX_PER_CITY = 3;

// Pure price-percentile ranking structurally never surfaces recognizable
// chains (they rarely undercut small unbranded operators on price), which
// undermines trust in a board full of unfamiliar names. Reserve a couple of
// slots for known multi-city brands if any place well enough within their
// own city to be defensible, without letting them skip the queue entirely.
const KNOWN_BRANDS = ["wework", "91springboard", "awfis", "indiqube", "smartworks", "bhive", "cowrks", "regus", "spaces", "incuspaze"];
const MIN_BRAND_SLOTS = 2;
const isKnownBrand = (name) => KNOWN_BRANDS.some((b) => name.toLowerCase().includes(b));

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
    supabase.from("spaces").select("id,name,price_from,amenities,city_id").eq("is_published", true).not("price_from", "is", null),
    supabase.from("cities").select("id,name,region"),
  ]);
  if (error) throw error;
  if (citiesError) throw citiesError;
  const regionByCity = new Map((cities ?? []).map((c) => [c.id, c.region]));

  // Delhi, Gurugram, and Noida are three separate "cities" in the data but
  // one metro commercially - capping each individually still let NCR take
  // 9 of 20 slots and crowd the top ranks (where the homepage's "top 5"
  // widget draws from) even though no single city broke its own cap. Group
  // them under one key so the cap applies to the metro, not each borough.
  const NCR_CITIES = new Set(["Delhi", "Gurugram", "Noida"]);
  const capGroupByCity = new Map(
    (cities ?? []).map((c) => [c.id, NCR_CITIES.has(c.name) ? "NCR" : c.id]),
  );

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
      list.push({ space_id: s.id, cap_group: capGroupByCity.get(cityId) ?? cityId, is_brand: isKnownBrand(s.name), value_score });
    });
    scoredByRegion.set(region, list);
  }

  // Selects up to TOP_N entries from a score-sorted list, in three passes
  // that all share one running per-city tally so the cap is never violated:
  //   1. Reserve up to MIN_BRAND_SLOTS for the best-scoring known brands.
  //   2. Fill the rest by score, respecting the per-city cap.
  //   3. If slots remain (cap made the board short of topN), fill ignoring
  //      the cap so the board never ends up smaller than topN.
  function selectTopN(sorted, topN) {
    const cityCounts = new Map();
    const picked = [];
    const pickedIds = new Set();

    function tryAdd(w, respectCap) {
      if (pickedIds.has(w.space_id)) return false;
      const cityCount = cityCounts.get(w.cap_group) ?? 0;
      if (respectCap && cityCount >= MAX_PER_CITY) return false;
      picked.push(w);
      pickedIds.add(w.space_id);
      cityCounts.set(w.cap_group, cityCount + 1);
      return true;
    }

    let brandCount = 0;
    for (const w of sorted) {
      if (brandCount >= MIN_BRAND_SLOTS) break;
      if (!w.is_brand) continue;
      if (tryAdd(w, true)) brandCount++;
    }

    for (const w of sorted) {
      if (picked.length >= topN) break;
      tryAdd(w, true);
    }

    for (const w of sorted) {
      if (picked.length >= topN) break;
      tryAdd(w, false);
    }

    return picked.sort((a, b) => b.value_score - a.value_score);
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
    selectTopN(list, TOP_N).forEach((w, i) => {
      rows.push({
        week_start,
        space_id: w.space_id,
        rank: i + 1,
        score: Number(w.value_score.toFixed(1)),
      });
    });
  }

  // Clear this week's existing rows first - an upsert alone leaves stale
  // rows behind for any space_id that drops out of this run's top N (e.g.
  // unpublished, or simply outscored), since upsert only touches rows for
  // space_ids present in the new payload.
  const { error: deleteError } = await supabase.from("weekly_winners").delete().eq("week_start", week_start);
  if (deleteError) throw deleteError;

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
