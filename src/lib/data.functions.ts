import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function makePublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
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
  avg_rating: number | null;
  review_count: number;
};

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();

  const { data: dispatchRows } = await supabase
    .from("dispatches")
    .select("id,slug,title,excerpt,cover_url,source_url,source_name,region,feed_id,tags,published_at,ingested_at,is_featured")
    .eq("is_hidden", false)
    .order("ingested_at", { ascending: false })
    .limit(60);

  const feedCategory = await fetchFeedCategories(supabase);
  const list = (dispatchRows ?? []).map((d) => ({ ...d, category: feedCategory.get(d.feed_id ?? "") ?? "blog" })) as Dispatch[];

  // First enforce an 80:20 real-news:blog mix, then re-balance 7:3 india:global on top.
  const news = list.filter((d) => d.category === "news");
  const blog = list.filter((d) => d.category === "blog");
  const categoryMixed = interleave(news, blog, 4, 1);

  const india = categoryMixed.filter((d) => d.region === "india");
  const global = categoryMixed.filter((d) => d.region === "global");
  const mixed = interleave(india, global, 7, 3);

  const { data: sotwRows } = await supabase
    .from("space_of_week")
    .select("space_id,editorial_note,week_start")
    .order("week_start", { ascending: false })
    .limit(1);
  const sotwSpaceId = sotwRows?.[0]?.space_id ?? null;

  const { data: allWinners } = await supabase
    .from("weekly_winners")
    .select("space_id,rank,score,week_start")
    .order("week_start", { ascending: false })
    .order("rank", { ascending: true })
    .limit(20);

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

  const { data: cities } = await supabase.from("cities").select("id,name,region");
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const cityRegionMap = new Map((cities ?? []).map((c) => [c.id, c.region]));

  // Homepage "five spaces India is talking about" must only feature Indian spaces.
  const winners = (allWinners ?? [])
    .filter((w) => {
      const space = (spaces ?? []).find((s) => s.id === w.space_id);
      return space && cityRegionMap.get(space.city_id ?? "") === "india";
    })
    .slice(0, 5);

  const { data: reviewAgg } = await supabase
    .from("reviews")
    .select("space_id,rating_overall")
    .in("space_id", spaceIds.length ? spaceIds : ["00000000-0000-0000-0000-000000000000"]);
  const aggMap = new Map<string, { sum: number; n: number }>();
  (reviewAgg ?? []).forEach((r) => {
    const cur = aggMap.get(r.space_id) ?? { sum: 0, n: 0 };
    cur.sum += Number(r.rating_overall);
    cur.n += 1;
    aggMap.set(r.space_id, cur);
  });
  const spaceById = new Map(
    (spaces ?? []).map((s) => {
      const agg = aggMap.get(s.id);
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
        avg_rating: agg ? Number((agg.sum / agg.n).toFixed(1)) : null,
        review_count: agg?.n ?? 0,
      };
      return [s.id, card];
    }),
  );

  const { data: salesQs } = await supabase
    .from("sales_questions")
    .select("id,text,category")
    .eq("approved", true)
    .eq("is_global", true)
    .order("upvotes_denorm", { ascending: false })
    .limit(8);

  return {
    dispatches: mixed.slice(0, 15),
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

  const { data: cities } = await supabase.from("cities").select("id,name,lat,lng").eq("region", "india");
  const { data: spaces } = await supabase.from("spaces").select("id,city_id").eq("is_published", true);

  let reviewCounts: { space_id: string }[] = [];
  let from = 0;
  while (true) {
    const { data: page } = await supabase.from("reviews").select("space_id").range(from, from + 999);
    reviewCounts = reviewCounts.concat(page ?? []);
    if (!page || page.length < 1000) break;
    from += 1000;
  }
  const reviewsBySpace = new Map<string, number>();
  for (const r of reviewCounts) reviewsBySpace.set(r.space_id, (reviewsBySpace.get(r.space_id) ?? 0) + 1);

  const stats: CityStat[] = (cities ?? []).map((c) => {
    const citySpaces = (spaces ?? []).filter((s) => s.city_id === c.id);
    const reviews = citySpaces.reduce((sum, s) => sum + (reviewsBySpace.get(s.id) ?? 0), 0);
    return { name: c.name, lat: Number(c.lat), lng: Number(c.lng), spaces: citySpaces.length, reviews };
  });

  return stats.sort((a, b) => b.reviews - a.reviews);
});

export const getSpaces = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id,slug,name,cover_url,description,price_from,currency,vibe_tags,city_id,lat,lng")
    .eq("is_published", true)
    .order("name");
  const { data: cities } = await supabase.from("cities").select("id,name,region");
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c]));
  const { data: reviewAgg } = await supabase.from("reviews").select("space_id,rating_overall");
  const aggMap = new Map<string, { sum: number; n: number }>();
  (reviewAgg ?? []).forEach((r) => {
    const cur = aggMap.get(r.space_id) ?? { sum: 0, n: 0 };
    cur.sum += Number(r.rating_overall);
    cur.n += 1;
    aggMap.set(r.space_id, cur);
  });
  return (spaces ?? []).map((s) => {
    const agg = aggMap.get(s.id);
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
      avg_rating: agg ? Number((agg.sum / agg.n).toFixed(1)) : null,
      review_count: agg?.n ?? 0,
    };
  });
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

    const [{ data: reviews }, { data: cityRow }, { data: salesQs }, { data: questions }] = await Promise.all([
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
    ]);

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
  const { data: winners } = await supabase
    .from("weekly_winners")
    .select("space_id,rank,score,week_start")
    .order("week_start", { ascending: false })
    .order("rank", { ascending: true });
  const spaceIds = Array.from(new Set((winners ?? []).map((w) => w.space_id)));
  const [{ data: spaces }, { data: cities }, { data: reviews }] = await Promise.all([
    spaceIds.length
      ? supabase.from("spaces").select("id,slug,name,cover_url,city_id,vibe_tags").in("id", spaceIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase.from("cities").select("id,name"),
    spaceIds.length
      ? supabase.from("reviews").select("space_id,rating_overall").in("space_id", spaceIds).eq("is_hidden", false)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const spaceMap = new Map((spaces ?? []).map((s) => [s.id, { ...s, city_name: cityMap.get(s.city_id ?? "") ?? null }]));

  const reviewsBySpace = new Map<string, number[]>();
  (reviews ?? []).forEach((r) => {
    const arr = reviewsBySpace.get(r.space_id) ?? [];
    arr.push(Number(r.rating_overall));
    reviewsBySpace.set(r.space_id, arr);
  });

  return (winners ?? [])
    .map((w) => {
      const ratings = reviewsBySpace.get(w.space_id) ?? [];
      const reviewCount = ratings.length;
      const avgRating = reviewCount ? ratings.reduce((a, b) => a + b, 0) / reviewCount : 0;
      const fiveStarPct = reviewCount ? ratings.filter((r) => r >= 4.5).length / reviewCount : 0;
      return {
        week_start: w.week_start,
        rank: w.rank,
        score: Number(w.score),
        space: spaceMap.get(w.space_id) ?? null,
        breakdown: {
          ratingComponent: Number(((avgRating / 5) * 60).toFixed(1)),
          volumeComponent: Number(((Math.min(reviewCount, 30) / 30) * 25).toFixed(1)),
          fiveStarComponent: Number((fiveStarPct * 15).toFixed(1)),
          avgRating: Number(avgRating.toFixed(1)),
          reviewCount,
        },
      };
    })
    .filter((w) => w.space);
});

export const getQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = makePublicClient();
  const { data: questions } = await supabase
    .from("questions")
    .select("id,title,body,is_ama,space_id,created_at,profile_id")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(200);
  const spaceIds = Array.from(new Set((questions ?? []).map((q) => q.space_id).filter(Boolean) as string[]));
  const profIds = Array.from(new Set((questions ?? []).map((q) => q.profile_id)));
  const [{ data: spaces }, { data: profs }, { data: allAns }] = await Promise.all([
    spaceIds.length
      ? supabase.from("spaces").select("id,slug,name").in("id", spaceIds)
      : Promise.resolve({ data: [] as any[] }),
    profIds.length
      ? supabase.from("profiles").select("id,display_name,avatar_url").in("id", profIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from("answers")
      .select("id,question_id,body,is_founder_reply,created_at,profile_id")
      .eq("is_hidden", false)
      .order("created_at", { ascending: true }),
  ]);
  const ansProfIds = Array.from(new Set((allAns ?? []).map((a) => a.profile_id)));
  const { data: ansProfs } = ansProfIds.length
    ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id", ansProfIds)
    : { data: [] as any[] };
  const ansProfMap = new Map((ansProfs ?? []).map((p) => [p.id, p]));
  const spaceMap = new Map((spaces ?? []).map((s) => [s.id, s]));
  const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
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
    questions: (questions ?? []).map((q) => ({
      ...q,
      space: q.space_id ? spaceMap.get(q.space_id) ?? null : null,
      author: profMap.get(q.profile_id) ?? null,
      answers: ansByQ.get(q.id) ?? [],
      answer_count: (ansByQ.get(q.id) ?? []).length,
    })),
    salesQuestions: salesQuestions ?? [],
  };
});

export const search = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const term = data.q.trim().slice(0, 100);
    if (!term) return { spaces: [], dispatches: [], questions: [] };
    const [{ data: spaces }, { data: dispatches }, { data: questions }] = await Promise.all([
      supabase.from("spaces").select("id,slug,name,cover_url").ilike("name", `%${term}%`).eq("is_published", true).limit(6),
      supabase.from("dispatches").select("id,slug,title,region").ilike("title", `%${term}%`).eq("is_hidden", false).limit(6),
      supabase.from("questions").select("id,title").ilike("title", `%${term}%`).eq("is_hidden", false).limit(6),
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
    const { supabase, userId } = context;

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
    return { ok: true };
  });
