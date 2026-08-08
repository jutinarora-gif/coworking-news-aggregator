import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notifyTeam } from "@/lib/notify";

// Built once per warm lambda instance instead of per request, so repeat
// invocations on the same instance can reuse the underlying HTTP connection
// instead of paying fresh connection-setup cost every time.
let _publicClient: ReturnType<typeof createClient<Database>> | null = null;
function makePublicClient() {
  if (_publicClient) return _publicClient;
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  _publicClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return _publicClient;
}

export type Dispatch = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  source_url: string | null;
  source_name: string | null;
  region: "india" | "global";
  category: "news" | "blog";
  tags: string[];
  published_at: string;
  ingested_at: string;
  is_featured: boolean;
};

// Interleaves two recency-sorted lists so `primary` appears `primaryPer`
// items for every `secondaryPer` items of `secondary`, without dropping
// anything (leftovers of whichever list runs out first get appended).
function interleave<T>(primary: T[], secondary: T[], primaryPer: number, secondaryPer: number): T[] {
  const out: T[] = [];
  let si = 0;
  for (let i = 0; i < primary.length; i++) {
    out.push(primary[i]);
    if ((i + 1) % primaryPer === 0 && si < secondary.length) {
      const take = Math.min(secondaryPer, secondary.length - si);
      for (let k = 0; k < take; k++) out.push(secondary[si++]);
    }
  }
  while (si < secondary.length) out.push(secondary[si++]);
  return out;
}

// The homepage feed must only ever show fresh news (unlike /dispatches,
// which intentionally keeps older articles around for SEO breadth). Feeds
// can resurface old articles that only just got re-linked/re-shared, so this
// filters by the article's own publish date, not when we ingested it.
const MAX_ARTICLE_AGE_DAYS = 14;
function maxArticleAgeCutoff() {
  return new Date(Date.now() - MAX_ARTICLE_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

async function fetchFeedCategories(supabase: ReturnType<typeof makePublicClient>) {
  const { data: feeds } = await supabase.from("feeds").select("id,category");
  return new Map((feeds ?? []).map((f) => [f.id, (f.category ?? "blog") as "news" | "blog"]));
}

export type SpaceCard = {
  id: string;
  slug: string;
  name: string;
  cover_url: string | null;
  description: string | null;
  price_from: number | null;
  currency: string;
  vibe_tags: string[];
  city_name: string | null;
};

const DISPATCH_COLS = "id,slug,title,excerpt,cover_url,source_url,source_name,region,feed_id,tags,published_at,ingested_at,is_featured";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();

  // Fetched as four independent pools (region x category) rather than a
  // shared recency-ordered window. Ingestion runs process feeds in a fixed
  // order, so whichever region's feeds ran last always wins a shared
  // "top N by ingested_at" query — starving the other region out entirely
  // even though both actually have fresh content.
  function fetchPool(feedIds: string[], region: "india" | "global", limit: number) {
    return feedIds.length
      ? supabase.from("dispatches").select(DISPATCH_COLS).eq("is_hidden", false).eq("region", region).in("feed_id", feedIds).gte("published_at", maxArticleAgeCutoff()).order("ingested_at", { ascending: false }).limit(limit)
      : Promise.resolve({ data: [] as Dispatch[] });
  }

  // feedCategory only gates the dispatch pools below - the other four
  // queries don't depend on it, so run all five in one round trip instead
  // of forcing everything to wait on the feed-category lookup first.
  const [feedCategory, { data: sotwRows }, { data: allWinners }, { data: cities }, { data: salesQs }] = await Promise.all([
    fetchFeedCategories(supabase),
    supabase
      .from("space_of_week")
      .select("space_id,editorial_note,week_start")
      .order("week_start", { ascending: false })
      .limit(1),
    supabase
      .from("weekly_winners")
      .select("space_id,rank,score,week_start")
      .order("week_start", { ascending: false })
      .order("rank", { ascending: true })
      .limit(20),
    supabase.from("cities").select("id,name,region"),
    supabase
      .from("sales_questions")
      .select("id,text,category")
      .eq("approved", true)
      .eq("is_global", true)
      .order("upvotes_denorm", { ascending: false })
      .limit(8),
  ]);

  const newsFeedIds = Array.from(feedCategory.entries()).filter(([, c]) => c === "news").map(([id]) => id);
  const blogFeedIds = Array.from(feedCategory.entries()).filter(([, c]) => c === "blog").map(([id]) => id);

  const [
    { data: newsIndiaRows },
    { data: newsGlobalRows },
    { data: blogIndiaRows },
    { data: blogGlobalRows },
  ] = await Promise.all([
    fetchPool(newsFeedIds, "india", 35),
    fetchPool(newsFeedIds, "global", 15),
    fetchPool(blogFeedIds, "india", 10),
    fetchPool(blogFeedIds, "global", 5),
  ]);

  const tag = (rows: typeof newsIndiaRows, category: "news" | "blog") =>
    (rows ?? []).map((d) => ({ ...d, category })) as Dispatch[];

  // Enforce 80:20 news:blog within each region, then 7:3 india:global across regions.
  const india = interleave(tag(newsIndiaRows, "news"), tag(blogIndiaRows, "blog"), 4, 1);
  const global = interleave(tag(newsGlobalRows, "news"), tag(blogGlobalRows, "blog"), 4, 1);
  const mixed = interleave(india, global, 7, 3);

  const sotwSpaceId = sotwRows?.[0]?.space_id ?? null;

  const spaceIds = Array.from(
    new Set([
      ...(sotwSpaceId ? [sotwSpaceId] : []),
      ...((allWinners ?? []).map((w) => w.space_id)),
    ]),
  );

  const { data: spaces } = await supabase
    .from("spaces")
    .select("id,slug,name,cover_url,description,price_from,currency,vibe_tags,city_id")
    .in("id", spaceIds.length ? spaceIds : ["00000000-0000-0000-0000-000000000000"]);

  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const cityRegionMap = new Map((cities ?? []).map((c) => [c.id, c.region]));

  // weekly_winners keeps one full rank-1..N set per week; rows are ordered
  // week_start desc, so the first row's week is the current one - drop
  // everything else before it can leak an older week's #1 into this list.
  const latestWinnersWeek = allWinners?.[0]?.week_start;
  const currentWeekWinners = (allWinners ?? []).filter((w) => w.week_start === latestWinnersWeek);

  // Homepage "five spaces India is talking about" must only feature Indian spaces.
  const winners = currentWeekWinners
    .filter((w) => {
      const space = (spaces ?? []).find((s) => s.id === w.space_id);
      return space && cityRegionMap.get(space.city_id ?? "") === "india";
    })
    .slice(0, 5);

  const spaceById = new Map(
    (spaces ?? []).map((s) => {
      const card: SpaceCard = {
        id: s.id,
        slug: s.slug,
        name: s.name,
        cover_url: s.cover_url,
        description: s.description,
        price_from: s.price_from,
        currency: s.currency,
        vibe_tags: s.vibe_tags ?? [],
        city_name: cityMap.get(s.city_id ?? "") ?? null,
      };
      return [s.id, card];
    }),
  );

  // Most RSS feeds have no real cover image, so ingestion pins a random
  // stock photo from a small pool per article — on a 9-card grid that
  // means visible repeats. Drop the image on any repeat past the first
  // so the card falls back to a clean text-only layout instead.
  const seenCovers = new Set<string>();
  const dedupedDispatches = mixed.slice(0, 15).map((d) => {
    if (!d.cover_url) return d;
    if (seenCovers.has(d.cover_url)) return { ...d, cover_url: null };
    seenCovers.add(d.cover_url);
    return d;
  });

  return {
    dispatches: dedupedDispatches,
    spaceOfWeek: sotwSpaceId
      ? { space: spaceById.get(sotwSpaceId) ?? null, note: sotwRows![0].editorial_note }
      : null,
    winners: winners.map((w, i) => ({
      rank: i + 1,
      score: Number(w.score),
      space: spaceById.get(w.space_id) ?? null,
    })).filter((w) => w.space),
    salesQuestions: (salesQs ?? []) as { id: string; text: string; category: string | null }[],
  };
});


export const getDispatches = createServerFn({ method: "GET" })
  .inputValidator((data: { region?: "india" | "global" | "all" }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    let query = supabase
      .from("dispatches")
      .select("id,slug,title,excerpt,cover_url,source_url,source_name,region,tags,published_at,ingested_at,is_featured")
      .eq("is_hidden", false)
      .order("ingested_at", { ascending: false })
      .limit(60);
    if (data.region === "india" || data.region === "global") {
      query = query.eq("region", data.region);
    }
    const { data: rows } = await query;
    return (rows ?? []) as Dispatch[];
  });

export const getDispatch = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const { data: row } = await supabase
      .from("dispatches")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_hidden", false)
      .maybeSingle();
    return row;
  });

export type CityStat = { name: string; lat: number; lng: number; spaces: number; reviews: number };

export const getCityStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();

  const [{ data: cities }, { data: spaces }] = await Promise.all([
    supabase.from("cities").select("id,name,lat,lng").eq("region", "india"),
    // Embedded count aggregates the review total per space in the database
    // itself, instead of pulling every review row over the wire to count client-side.
    supabase.from("spaces").select("id,city_id,reviews(count)").eq("is_published", true),
  ]);

  const reviewsBySpace = new Map<string, number>(
    (spaces ?? []).map((s) => [s.id, (s.reviews as unknown as { count: number }[])?.[0]?.count ?? 0]),
  );

  const stats: CityStat[] = (cities ?? []).map((c) => {
    const citySpaces = (spaces ?? []).filter((s) => s.city_id === c.id);
    const reviews = citySpaces.reduce((sum, s) => sum + (reviewsBySpace.get(s.id) ?? 0), 0);
    return { name: c.name, lat: Number(c.lat), lng: Number(c.lng), spaces: citySpaces.length, reviews };
  });

  return stats.sort((a, b) => b.reviews - a.reviews);
});

export const getSpaces = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();
  const [{ data: spaces }, { data: cities }] = await Promise.all([
    supabase
      .from("spaces")
      .select("id,slug,name,cover_url,description,price_from,currency,vibe_tags,city_id,lat,lng")
      .eq("is_published", true)
      .order("name"),
    supabase.from("cities").select("id,name,region"),
  ]);
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c]));

  return (spaces ?? []).map((s) => {
    const c = cityMap.get(s.city_id ?? "");
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      cover_url: s.cover_url,
      description: s.description,
      price_from: s.price_from,
      currency: s.currency,
      vibe_tags: s.vibe_tags ?? [],
      city_name: c?.name ?? null,
      city_region: c?.region ?? null,
      lat: s.lat,
      lng: s.lng,
    };
  });
});

function median(sorted: number[]) {
  const n = sorted.length;
  if (!n) return null;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Shared by getHomePriceStats (city medians) and getSpace's per-space "price
// in context" callout - both need the same per-city priced-space list, so
// this is computed once from the same query shape rather than duplicated.
async function fetchCityPricing(supabase: ReturnType<typeof makePublicClient>) {
  const [{ data: spaces }, { data: cities }] = await Promise.all([
    supabase.from("spaces").select("id,price_from,currency,city_id").eq("is_published", true).not("price_from", "is", null),
    supabase.from("cities").select("id,name,region"),
  ]);
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c]));
  const byCity = new Map<string, { id: string; price_from: number; currency: string }[]>();
  (spaces ?? []).forEach((s) => {
    if (!s.city_id) return;
    const list = byCity.get(s.city_id) ?? [];
    list.push({ id: s.id, price_from: s.price_from!, currency: s.currency });
    byCity.set(s.city_id, list);
  });
  return { byCity, cityMap };
}

export type HomePriceStats = {
  cities: { name: string; region: "india" | "global" | null; median: number; min: number; max: number; count: number }[];
  newest: SpaceCard[];
  lastUpdated: string | null;
};

export const getHomePriceStats = createServerFn({ method: "GET" }).handler(async (): Promise<HomePriceStats> => {
  const supabase = makePublicClient();
  const { byCity, cityMap } = await fetchCityPricing(supabase);

  const MIN_SAMPLE = 2;
  const cities = Array.from(byCity.entries())
    .filter(([, list]) => list.length >= MIN_SAMPLE)
    .map(([cityId, list]) => {
      const prices = list.map((s) => s.price_from).sort((a, b) => a - b);
      const c = cityMap.get(cityId);
      return {
        name: c?.name ?? "Unknown",
        region: (c?.region as "india" | "global" | null) ?? null,
        median: median(prices)!,
        min: prices[0],
        max: prices[prices.length - 1],
        count: prices.length,
      };
    })
    .sort((a, b) => b.count - a.count);

  const { data: newestRows } = await supabase
    .from("spaces")
    .select("id,slug,name,cover_url,description,price_from,currency,vibe_tags,city_id")
    .eq("is_published", true)
    .not("price_from", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);
  const newest: SpaceCard[] = (newestRows ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    cover_url: s.cover_url,
    description: s.description,
    price_from: s.price_from,
    currency: s.currency,
    vibe_tags: s.vibe_tags ?? [],
    city_name: cityMap.get(s.city_id ?? "")?.name ?? null,
  }));

  // No verified_at column on spaces yet - "last checked" stays hidden
  // (the UI already handles null) rather than fabricate a date.
  return { cities, newest, lastUpdated: null };
});

export const getSpace = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const { data: space } = await supabase
      .from("spaces")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!space) return null;

    const [{ data: reviews }, { data: cityRow }, { data: salesQs }, { data: questions }, { data: sameCityRaw }] = await Promise.all([
      supabase
        .from("reviews")
        .select("id,rating_overall,rating_wifi,rating_quiet,rating_community,rating_coffee,rating_value,title,body,pros,cons,photos,created_at,profile_id")
        .eq("space_id", space.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
      space.city_id
        ? supabase.from("cities").select("id,name,region").eq("id", space.city_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("sales_questions")
        .select("id,text,category,upvotes_denorm")
        .eq("approved", true)
        .or(`space_id.eq.${space.id},is_global.eq.true`)
        .order("upvotes_denorm", { ascending: false })
        .limit(20),
      supabase
        .from("questions")
        .select("id,title,body,is_ama,created_at,profile_id")
        .eq("space_id", space.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(10),
      space.city_id
        ? supabase
            .from("spaces")
            .select("id,slug,name,price_from,currency")
            .eq("city_id", space.city_id)
            .eq("is_published", true)
            .not("price_from", "is", null)
        : Promise.resolve({ data: [] as { id: string; slug: string; name: string; price_from: number; currency: string }[] }),
    ]);

    let priceContext: {
      median: number;
      min: number;
      max: number;
      count: number;
      rank: number;
      cheaperThan: number;
      pctVsMedian: number;
      sameCity: { slug: string; name: string; price_from: number; currency: string }[];
    } | null = null;
    if (space.price_from != null && space.city_id) {
      const sameCity = (sameCityRaw ?? []).filter((s): s is typeof s & { price_from: number } => s.price_from != null);
      const cityPrices = sameCity.map((s) => s.price_from).sort((a, b) => a - b);
      if (cityPrices.length >= 2) {
        const med = median(cityPrices)!;
        const rank = cityPrices.filter((p) => p < space.price_from!).length + 1;
        const cheaperThan = cityPrices.filter((p) => p > space.price_from!).length;
        priceContext = {
          median: med,
          min: cityPrices[0],
          max: cityPrices[cityPrices.length - 1],
          count: cityPrices.length,
          rank,
          cheaperThan,
          pctVsMedian: Number((((space.price_from - med) / med) * 100).toFixed(0)),
          sameCity: sameCity
            .filter((s) => s.id !== space.id)
            .sort((a, b) => a.price_from - b.price_from)
            .slice(0, 5)
            .map((s) => ({ slug: s.slug, name: s.name, price_from: s.price_from, currency: s.currency })),
        };
      }
    }

    const profileIds = Array.from(new Set([
      ...(reviews ?? []).map((r) => r.profile_id),
      ...(questions ?? []).map((q) => q.profile_id),
    ]));
    const { data: profs } = profileIds.length
      ? await supabase.from("profiles").select("id,display_name,avatar_url,is_verified_coworker,city").in("id", profileIds)
      : { data: [] as any[] };
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));

    const revList = reviews ?? [];
    const agg = revList.length
      ? {
          avg: Number((revList.reduce((s, r) => s + Number(r.rating_overall), 0) / revList.length).toFixed(1)),
          n: revList.length,
          wifi: avg(revList.map((r) => r.rating_wifi)),
          quiet: avg(revList.map((r) => r.rating_quiet)),
          community: avg(revList.map((r) => r.rating_community)),
          coffee: avg(revList.map((r) => r.rating_coffee)),
          value: avg(revList.map((r) => r.rating_value)),
        }
      : null;

    return {
      space: { ...space, city_name: cityRow?.name ?? null, city_region: cityRow?.region ?? null },
      reviews: revList.map((r) => ({ ...r, author: profMap.get(r.profile_id) ?? null })),
      agg,
      priceContext,
      salesQuestions: salesQs ?? [],
      questions: (questions ?? []).map((q) => ({ ...q, author: profMap.get(q.profile_id) ?? null })),
    };
  });

function avg(arr: (number | null)[]) {
  const clean = arr.filter((n): n is number => typeof n === "number");
  if (!clean.length) return null;
  return Number((clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1));
}

export const getWinners = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();
  // weekly_winners accumulates one full rank-1..N set per week, so an
  // unfiltered query returns every past week's winners back to back, each
  // restarting at #1 — reads as a broken/duplicated ranking. Only the
  // most recent week is a real "current" leaderboard.
  const { data: latestWeekRow } = await supabase
    .from("weekly_winners")
    .select("week_start")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: winners } = latestWeekRow
    ? await supabase
        .from("weekly_winners")
        .select("space_id,rank,score,week_start")
        .eq("week_start", latestWeekRow.week_start)
        .order("rank", { ascending: true })
    : { data: [] as { space_id: string; rank: number; score: number; week_start: string }[] };
  const spaceIds = Array.from(new Set((winners ?? []).map((w) => w.space_id)));
  const [{ data: spaces }, { data: cities }] = await Promise.all([
    spaceIds.length
      ? supabase.from("spaces").select("id,slug,name,cover_url,city_id,vibe_tags,price_from,currency,amenities").in("id", spaceIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase.from("cities").select("id,name"),
  ]);
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const spaceMap = new Map((spaces ?? []).map((s) => [s.id, { ...s, city_name: cityMap.get(s.city_id ?? "") ?? null }]));

  return (winners ?? [])
    .map((w) => {
      const space = spaceMap.get(w.space_id) ?? null;
      return {
        week_start: w.week_start,
        rank: w.rank,
        score: Number(w.score),
        space,
        breakdown: space
          ? { price_from: space.price_from, currency: space.currency, amenity_count: (space.amenities as string[] | null)?.length ?? 0 }
          : null,
      };
    })
    .filter((w) => w.space);
});

export type LeaderboardEntry = { name: string; slug: string; cityName: string | null; rank: number };
export type Leaderboards = Record<
  "wifi" | "community" | "clean" | "support" | "ac" | "meet",
  LeaderboardEntry[]
>;

// Curated by hand for now (real reviews are too sparse to rank fairly yet -
// see engineering notes on the "real reviews" cleanup). Deliberately weighted
// toward recognizable multi-location operators (~70%) with a handful of
// well-regarded independents (~30%) mixed in, rather than letting a single
// single-location space with a handful of reviews top a category. Swap this
// for a live-computed ranking once there's enough real review volume per
// space to be statistically meaningful.
const CURATED_LEADERBOARD: Record<keyof Leaderboards, string[]> = {
  wifi: [
    "wework-embassy-galaxy-business-park-sector-62-noida",
    "awfis-prestige-technology-park-marathahalli-bangalore",
    "devx-vastrapur-ahmedabad",
  ],
  community: [
    "wework-berger-delhi-one-sector-16-noida",
    "91springboard-bkc-kalina-bandra-kurla-complex-mumbai",
    "innov8-clc-sector-44-gurugram",
  ],
  clean: [
    "smartworks-paradigm-malad-west-mumbai",
    "indiqube-palmyra-saidapet-chennai",
    "sentient-thaltej-ahmedabad",
  ],
  support: [
    "cowrks-worldmark-aerocity-delhi-ncr",
    "regus-south-tower-nungambakkam-chennai",
    "office-culture-mansarovar-jaipur",
  ],
  ac: [
    "akasa-corenthum-sector-62-noida",
    "innov8-graphix-tower-sector-62-noida",
    "ignite-edc-innovation-hub-panaji-goa",
  ],
  meet: [
    "91springboard-hitec-city-hitec-city-hyderabad",
    "smartworks-golden-millenium-vasanth-nagar-bangalore",
    "5b-colab-vishwabharti-society-ahmedabad",
  ],
};

export const getLeaderboards = createServerFn({ method: "GET" }).handler(async (): Promise<Leaderboards> => {
  const supabase = makePublicClient();
  const allSlugs = Array.from(new Set(Object.values(CURATED_LEADERBOARD).flat()));
  const [{ data: spaces }, { data: cities }] = await Promise.all([
    supabase.from("spaces").select("name,slug,city_id").in("slug", allSlugs),
    supabase.from("cities").select("id,name"),
  ]);
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const spaceBySlug = new Map((spaces ?? []).map((s) => [s.slug, s]));

  const result = {} as Leaderboards;
  for (const key of Object.keys(CURATED_LEADERBOARD) as (keyof Leaderboards)[]) {
    result[key] = CURATED_LEADERBOARD[key]
      .map((slug, i) => {
        const sp = spaceBySlug.get(slug);
        if (!sp) return null;
        return { name: sp.name, slug: sp.slug, cityName: cityMap.get(sp.city_id ?? "") ?? null, rank: i + 1 };
      })
      .filter((e): e is LeaderboardEntry => e !== null);
  }
  return result;
});

export const getQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();

  // city_id on questions lets city-only (space-less) questions be filtered
  // too; falls back gracefully if that migration hasn't been run yet.
  let questions: any[] | null = null;
  {
    const withCity = await supabase
      .from("questions")
      .select("id,title,body,is_ama,space_id,city_id,created_at,profile_id")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(200);
    if (withCity.error) {
      const withoutCity = await supabase
        .from("questions")
        .select("id,title,body,is_ama,space_id,created_at,profile_id")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(200);
      questions = (withoutCity.data ?? []).map((q) => ({ ...q, city_id: null }));
    } else {
      questions = withCity.data;
    }
  }

  const spaceIds = Array.from(new Set((questions ?? []).map((q) => q.space_id).filter(Boolean) as string[]));
  const profIds = Array.from(new Set((questions ?? []).map((q) => q.profile_id)));
  const [{ data: spaces }, { data: profs }, { data: allAns }, { data: cities }] = await Promise.all([
    spaceIds.length
      ? supabase.from("spaces").select("id,slug,name,city_id,address").in("id", spaceIds)
      : Promise.resolve({ data: [] as any[] }),
    profIds.length
      ? supabase.from("profiles").select("id,display_name,avatar_url").in("id", profIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from("answers")
      .select("id,question_id,body,is_founder_reply,created_at,profile_id")
      .eq("is_hidden", false)
      .order("created_at", { ascending: true }),
    supabase.from("cities").select("id,name"),
  ]);
  const ansProfIds = Array.from(new Set((allAns ?? []).map((a) => a.profile_id)));
  const { data: ansProfs } = ansProfIds.length
    ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id", ansProfIds)
    : { data: [] as any[] };
  const ansProfMap = new Map((ansProfs ?? []).map((p) => [p.id, p]));
  const spaceMap = new Map((spaces ?? []).map((s) => [s.id, s]));
  const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const ansByQ = new Map<string, any[]>();
  (allAns ?? []).forEach((a) => {
    const arr = ansByQ.get(a.question_id) ?? [];
    arr.push({ ...a, author: ansProfMap.get(a.profile_id) ?? null });
    ansByQ.set(a.question_id, arr);
  });
  const { data: salesQuestions } = await supabase
    .from("sales_questions")
    .select("id,text,category,space_id")
    .eq("approved", true)
    .eq("is_global", true)
    .order("upvotes_denorm", { ascending: false });

  return {
    questions: (questions ?? []).map((q) => {
      const space = q.space_id ? spaceMap.get(q.space_id) ?? null : null;
      const effectiveCityId = q.city_id ?? space?.city_id ?? null;
      return {
        ...q,
        space,
        city_name: effectiveCityId ? cityMap.get(effectiveCityId) ?? null : null,
        author: profMap.get(q.profile_id) ?? null,
        answers: ansByQ.get(q.id) ?? [],
        answer_count: (ansByQ.get(q.id) ?? []).length,
      };
    }),
    salesQuestions: salesQuestions ?? [],
  };
});

export const search = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const term = data.q.trim().slice(0, 100);
    if (!term) return { spaces: [], dispatches: [], questions: [] };
    const esc = term.replace(/[%_,]/g, (c) => `\\${c}`);
    const [{ data: spaces }, { data: dispatches }, { data: questions }] = await Promise.all([
      // Matches name (e.g. "WeWork") and address (which embeds area + city,
      // e.g. "Koramangala, Bangalore") so a city or locality search actually works.
      supabase.from("spaces").select("id,slug,name,cover_url").or(`name.ilike.%${esc}%,address.ilike.%${esc}%`).eq("is_published", true).limit(6),
      supabase.from("dispatches").select("id,slug,title,region").or(`title.ilike.%${esc}%,excerpt.ilike.%${esc}%`).eq("is_hidden", false).limit(6),
      supabase.from("questions").select("id,title").ilike("title", `%${esc}%`).eq("is_hidden", false).limit(6),
    ]);
    return {
      spaces: spaces ?? [],
      dispatches: dispatches ?? [],
      questions: questions ?? [],
    };
  });

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    space_id: string;
    rating_overall: number;
    rating_wifi?: number;
    rating_quiet?: number;
    rating_community?: number;
    rating_coffee?: number;
    rating_value?: number;
    title?: string;
    body: string;
    pros?: string;
    cons?: string;
  }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    if (!data.body?.trim() || data.body.trim().length < 20) {
      throw new Error("Reviews need at least 20 characters. Give it a sentence or two.");
    }
    if (!(data.rating_overall >= 1 && data.rating_overall <= 5)) {
      throw new Error("Overall rating must be between 1 and 5.");
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .insert({ auth_user_id: userId, display_name: "Coworker" })
        .select("id")
        .single();
      if (createError) throw new Error(createError.message);
      profile = created;
    }

    const { error } = await supabase.from("reviews").insert({
      space_id: data.space_id,
      profile_id: profile.id,
      rating_overall: data.rating_overall,
      rating_wifi: data.rating_wifi ?? null,
      rating_quiet: data.rating_quiet ?? null,
      rating_community: data.rating_community ?? null,
      rating_coffee: data.rating_coffee ?? null,
      rating_value: data.rating_value ?? null,
      title: data.title ?? null,
      body: data.body.trim(),
      pros: data.pros ?? null,
      cons: data.cons ?? null,
    });
    if (error) throw new Error(error.message);

    const { data: space } = await supabase.from("spaces").select("name,slug").eq("id", data.space_id).maybeSingle();
    void notifyTeam("New review submitted", {
      Space: space?.name ?? data.space_id,
      Rating: `${data.rating_overall}/5`,
      Reviewer: (claims as { email?: string })?.email ?? userId,
      Body: data.body.trim(),
      Link: space?.slug ? `https://www.coworkingdispatch.com/spaces/${space.slug}` : undefined,
    });

    return { ok: true };
  });

export const submitQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; body?: string; space_id?: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    if (!data.title?.trim() || data.title.trim().length < 10) {
      throw new Error("Give your question a bit more detail — at least 10 characters.");
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .insert({ auth_user_id: userId, display_name: "Coworker" })
        .select("id")
        .single();
      if (createError) throw new Error(createError.message);
      profile = created;
    }

    const { data: inserted, error } = await supabase
      .from("questions")
      .insert({
        profile_id: profile.id,
        title: data.title.trim(),
        body: data.body?.trim() || null,
        space_id: data.space_id || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const space = data.space_id
      ? (await supabase.from("spaces").select("name").eq("id", data.space_id).maybeSingle()).data
      : null;
    void notifyTeam("New question asked", {
      Title: data.title.trim(),
      Space: space?.name,
      Asker: (claims as { email?: string })?.email ?? userId,
      Link: "https://www.coworkingdispatch.com/questions",
    });

    return { ok: true, id: inserted.id };
  });

export const getCities = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();
  const { data } = await supabase.from("cities").select("id,name,region").order("name");
  return data ?? [];
});

function slugify(name: string, cityName: string | undefined) {
  const base = `${name}${cityName ? ` ${cityName}` : ""}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "space";
}

export const submitSpace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    name: string;
    city_id: string;
    address?: string;
    description: string;
    website_url?: string;
    price_from?: number;
    currency?: string;
    vibe_tags?: string[];
  }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    if (!data.name?.trim() || data.name.trim().length < 2) {
      throw new Error("Space name is required.");
    }
    if (!data.city_id) {
      throw new Error("Please select a city.");
    }
    if (!data.description?.trim() || data.description.trim().length < 20) {
      throw new Error("Description needs at least 20 characters — give people a real sense of the place.");
    }

    const { data: city } = await supabase.from("cities").select("name").eq("id", data.city_id).maybeSingle();

    let slug = slugify(data.name, city?.name);
    const { data: existing } = await supabase.from("spaces").select("slug").ilike("slug", `${slug}%`);
    if (existing && existing.length > 0) {
      const taken = new Set(existing.map((s) => s.slug));
      let i = 2;
      while (taken.has(slug)) slug = `${slugify(data.name, city?.name)}-${i++}`;
    }

    const { error } = await supabase.from("spaces").insert({
      name: data.name.trim(),
      slug,
      city_id: data.city_id,
      address: data.address?.trim() || null,
      description: data.description.trim(),
      website_url: data.website_url?.trim() || null,
      price_from: data.price_from ?? null,
      currency: data.currency?.trim() || "INR",
      vibe_tags: data.vibe_tags?.filter(Boolean) ?? [],
      is_published: false,
      submitted_by: userId,
    });
    if (error) throw new Error(error.message);

    void notifyTeam("New space submitted", {
      Name: data.name.trim(),
      City: city?.name,
      "Submitted by": (claims as { email?: string })?.email ?? userId,
      Description: data.description.trim(),
    });

    return { ok: true, slug };
  });

export const getMySpaceSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("spaces")
      .select("id,slug,name,is_published,created_at,city_id")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// Relies entirely on RLS, not an app-level role check: the "Admins/mods can
// manage spaces" policy is the only thing that can see is_published=false
// rows belonging to someone else, so a non-admin calling this simply gets
// back their own pending submissions (if any) rather than everyone's.
export const getPendingSpaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [{ data: spaces }, { data: cities }] = await Promise.all([
      supabase
        .from("spaces")
        .select("id,slug,name,address,description,website_url,price_from,currency,vibe_tags,city_id,submitted_by,created_at")
        .eq("is_published", false)
        .order("created_at", { ascending: false }),
      supabase.from("cities").select("id,name"),
    ]);
    const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
    return (spaces ?? []).map((s) => ({ ...s, city_name: cityMap.get(s.city_id ?? "") ?? null }));
  });

export const approveSpace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { space_id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: updated, error } = await supabase
      .from("spaces")
      .update({ is_published: true })
      .eq("id", data.space_id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Not authorized, or this space is no longer pending.");
    return { ok: true };
  });

export const rejectSpace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { space_id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: deleted, error } = await supabase
      .from("spaces")
      .delete()
      .eq("id", data.space_id)
      .eq("is_published", false)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!deleted) throw new Error("Not authorized, or this space is no longer pending.");
    return { ok: true };
  });

export const notifySignup = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    void notifyTeam("New account signup", { Email: data.email.trim().toLowerCase() });
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const email = data.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
      throw new Error("Please enter a valid email");
    }
    const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: "web" });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw new Error(error.message);
    void notifyTeam("New newsletter signup", { Email: email });
    return { ok: true };
  });

export const submitJobApplication = createServerFn({ method: "POST" })
  .inputValidator((data: {
    role: string;
    name: string;
    email: string;
    phone?: string;
    portfolio_url?: string;
    message?: string;
    current_ctc?: string;
    expected_ctc?: string;
    notice_period?: string;
    resume_path?: string;
  }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (!name || name.length < 2) throw new Error("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) throw new Error("Please enter a valid email.");
    if (!data.role?.trim()) throw new Error("Missing role.");
    if (!data.current_ctc?.trim()) throw new Error("Please enter your current CTC.");
    if (!data.expected_ctc?.trim()) throw new Error("Please enter your expected CTC.");
    if (!data.notice_period?.trim()) throw new Error("Please enter your notice period.");

    const { error } = await supabase.from("job_applications").insert({
      role: data.role.trim(),
      name,
      email,
      phone: data.phone?.trim() || null,
      portfolio_url: data.portfolio_url?.trim() || null,
      message: data.message?.trim() || null,
      current_ctc: data.current_ctc?.trim() || null,
      expected_ctc: data.expected_ctc?.trim() || null,
      notice_period: data.notice_period?.trim() || null,
      resume_path: data.resume_path?.trim() || null,
    });
    if (error) throw new Error(error.message);

    void notifyTeam("New job application", {
      Role: data.role.trim(),
      Name: name,
      Email: email,
      Phone: data.phone?.trim(),
      "Current CTC": data.current_ctc?.trim(),
      "Expected CTC": data.expected_ctc?.trim(),
      "Notice period": data.notice_period?.trim(),
      Portfolio: data.portfolio_url?.trim(),
    });

    return { ok: true };
  });
