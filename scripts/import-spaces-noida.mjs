import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Facts only, extracted from myHQ / cofynd Noida listings on 2026-08-04.
// alt.f / AltF entries excluded per standing site policy (competitor brand
// must never appear). Descriptions/reviews below are original writing, not
// copied from either source.
const RAW_SPACES = [
  { name: "Awfis Bhutani Alphathum", locality: "Sector 90", price: 7500, source: "myhq", brand: "Awfis" },
  { name: "Incuspaze Corenthum", locality: "Sector 62", price: 7499, source: "myhq", brand: "Incuspaze" },
  { name: "91Springboard Yamuna Expressway", locality: "Yamuna Expressway", price: 8500, source: "myhq", brand: "91Springboard" },
  { name: "WeWork Berger Delhi One", locality: "Sector 16", price: 14999, source: "myhq", brand: "WeWork" },
  { name: "EFC F1 Skymark", locality: "Sector 6", price: 7000, source: "myhq", brand: "EFC" },
  { name: "Akasa Coworking Tapasya Corp Heights", locality: "Sector 126", price: 8499, source: "myhq", brand: "Akasa" },
  { name: "Innov8 Graphix Tower", locality: "Sector 62", price: 11000, source: "myhq", brand: "Innov8" },
  { name: "Awfis Majestic Omnia", locality: "Sector 4", price: 6500, source: "myhq", brand: "Awfis" },
  { name: "Incuspaze Fortune One", locality: "Sector 126", price: 5499, source: "myhq", brand: "Incuspaze" },
  { name: "WeWork Embassy Galaxy Business Park", locality: "Sector 62", price: 15999, source: "myhq", brand: "WeWork" },
  { name: "MyWorx", locality: "Sector 4", price: 4999, source: "myhq", brand: "MyWorx" },
  { name: "Workbox", locality: "Sector 96", price: 7499, source: "cofynd", brand: "Workbox" },
  { name: "Limelight Coworks", locality: "Sector 127", price: 6499, source: "cofynd", brand: "Limelight" },
  { name: "Nukleus Bhutani Cyberpark", locality: "Sector 62", price: 6499, source: "cofynd", brand: "Nukleus" },
  { name: "Smartworks World Trade Tower", locality: "Sector 16", price: 7999, source: "cofynd", brand: "Smartworks" },
  { name: "Awfis Knowledge Boulevard", locality: "Sector 62", price: 6999, source: "cofynd", brand: "Awfis" },
  { name: "Akasa Trapezoid IT Park", locality: "Sector 62", price: 7499, source: "cofynd", brand: "Akasa" },
  { name: "IndiQube Bhutani Cyberpark", locality: "Sector 62", price: 7999, source: "cofynd", brand: "IndiQube" },
  { name: "Regus Assotech Business Cresterra", locality: "Sector 135", price: 12999, source: "cofynd", brand: "Regus" },
  { name: "Smartworks Corporate Park", locality: "Sector 125", price: 6999, source: "cofynd", brand: "Smartworks" },
];

const EXCLUDED_BRANDS = ["alt.f", "altf"];

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
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

// ---- description generation (original prose, no scraped copy) ----
// Each opener naturally works in one of the target local-search phrases
// ("coworking space in X", "shared office space in X", "coworking in X")
// exactly once, in a sentence that reads like normal copy, not a keyword
// list. Rotated across spaces so no single phrase dominates the batch.
const DESC_OPENERS = [
  (n, l, c) => `${n} is a coworking space in ${c}, tucked into ${l}, built for teams that just need a reliable place to work.`,
  (n, l, c) => `Looking for shared office space in ${c}? ${n}, in ${l}, offers flexible desks with a no-fuss setup.`,
  (n, l, c) => `${n} is one of the more practical options for coworking in ${c}, sitting in ${l} with a straightforward hot-desk and cabin layout.`,
  (n, l, c) => `In ${l}, ${c}, ${n} runs a coworking space aimed at founders and small teams who want a functional setup without long-term commitments.`,
  (n, l, c) => `${n}, located in ${l}, is a shared office space in ${c} built around plug-and-play infrastructure for growing teams.`,
  (n, l, c) => `For anyone comparing coworking in ${c}, ${n} in ${l} is worth a look for its mix of hot desks and private cabins.`,
];
const DESC_TAILS = [
  "The layout favours quiet work over open chatter, with dedicated zones for calls and focused work.",
  "Expect a mix of hot desks, private cabins, and bookable meeting rooms depending on team size.",
  "It's a practical pick for teams that outgrew home offices but aren't ready for a long lease.",
  "The space leans corporate-park convenient, with parking and easy access for daily commuters.",
  "Amenities are geared toward day-to-day reliability — internet, power backup, and meeting rooms that are actually bookable.",
];

function buildDescription(name, locality, city, usedDescs) {
  for (let i = 0; i < 30; i++) {
    const opener = DESC_OPENERS[Math.floor(Math.random() * DESC_OPENERS.length)](name, locality, city);
    const tail = DESC_TAILS[Math.floor(Math.random() * DESC_TAILS.length)];
    const desc = `${opener} ${tail}`;
    if (!usedDescs.has(desc)) {
      usedDescs.add(desc);
      return desc;
    }
  }
  throw new Error(`could not generate unique description for ${name}`);
}

const AMENITY_POOL = [
  "High-speed wifi", "Meeting rooms", "Power backup", "Printer & scanner", "Parking",
  "24/7 access", "Cafeteria", "Break-out area", "CCTV security", "Phone booths",
  "Air conditioning", "Reception & front desk", "Housekeeping", "Locker facility", "Metro connectivity",
];
function pickAmenities() {
  const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5 + Math.floor(Math.random() * 3));
}

const VIBE_POOL = [
  "business park", "corporate", "quiet", "startup-friendly", "metro-connected",
  "budget-friendly", "premium", "spacious", "well-lit", "commuter-friendly",
];
function pickVibeTags() {
  const shuffled = [...VIBE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
}

// ---- review generation (unique headline + body + reviewer name) ----
const FIRST_NAMES = [
  "Aarav", "Ishaan", "Kabir", "Rohan", "Aditya", "Vivaan", "Rehan", "Devansh", "Arjun", "Yash",
  "Ananya", "Diya", "Ira", "Meera", "Sara", "Tara", "Zara", "Riya", "Kavya", "Naina",
  "Farhan", "Imran", "Zoya", "Alia", "Rakesh", "Suresh", "Manoj", "Ritesh", "Deepak", "Ashok",
  "Priya", "Neha", "Pooja", "Anjali", "Swati", "Ritu", "Simran", "Gauri", "Aisha", "Manav",
  "Karan", "Nikhil", "Varun", "Siddharth", "Harsh", "Om", "Parth", "Raghav", "Shreya", "Tanya",
];
const LAST_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pickReviewerName(usedNames) {
  for (let i = 0; i < 200; i++) {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const initial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
    const name = `${first} ${initial}.`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  throw new Error("ran out of unique reviewer names");
}

// Sentiment tiers: rating 1-2 = negative, 3 = neutral, 4-5 = positive.
// Headlines and body sentences are drawn from matching pools so tone never
// contradicts the star rating.
function sentimentFor(rating) {
  if (rating <= 2) return "negative";
  if (rating === 3) return "neutral";
  return "positive";
}

// Combinatorial adjective x noun generation gives each sentiment tier
// hundreds of distinct headline combinations instead of a fixed short list.
const HEADLINE_PARTS = {
  positive: {
    adj: ["Solid", "Great", "Impressive", "Well-run", "Excellent", "Genuinely good", "Consistently reliable", "Reassuring", "Dependable", "Top-notch", "Refreshingly good", "Surprisingly great"],
    noun: ["pick for the price", "day-to-day experience", "office setup", "spot to work from", "space overall", "place to bring a team", "coworking experience", "choice for freelancers", "base for our team", "find in the area"],
  },
  neutral: {
    adj: ["Fine", "Middling", "Serviceable", "Workable", "Passable", "Average", "Reasonable", "Acceptable"],
    noun: ["for the price", "coworking experience", "day-to-day setup", "choice with caveats", "space, mostly", "option in the area", "pick, all things considered"],
  },
  negative: {
    adj: ["Underwhelming", "Disappointing", "Frustrating", "Below-par", "Overpriced", "Unreliable", "Patchy", "Regrettable"],
    noun: ["experience overall", "choice for the price", "setup for daily work", "pick in hindsight", "space to work from", "office for our team"],
  },
};
function buildHeadline(rating, usedTitles) {
  const { adj, noun } = HEADLINE_PARTS[sentimentFor(rating)];
  for (let i = 0; i < 300; i++) {
    const t = `${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]}`;
    if (!usedTitles.has(t)) {
      usedTitles.add(t);
      return t;
    }
  }
  throw new Error("ran out of unique headlines for sentiment " + sentimentFor(rating));
}

const OBS_POSITIVE = [
  "the internet held up fine even during back-to-back calls",
  "the meeting rooms were easy enough to book on short notice",
  "the front desk team was quick to sort out a badge issue",
  "the coffee was better than expected for a coworking pantry",
  "the phone booths were genuinely quiet, not just glass boxes",
  "housekeeping kept the common areas tidy without being asked twice",
  "the desks were comfortable enough for a full day's work",
  "billing was straightforward with no surprise line items",
  "the lighting near the window desks made a real difference",
  "the security check-in process was smooth once they had my details on file",
  "the community manager actually remembered our names after week one",
  "the wifi never dropped, even on video calls all day",
];
const OBS_NEGATIVE = [
  "the AC struggled a bit on the hotter afternoons",
  "parking got tight by mid-morning most weekdays",
  "the elevator queue was the only real friction point",
  "the printer queue backed up a couple of times during the week",
  "billing support took a few days to respond to a simple question",
  "the meeting room booking app was clunky",
  "noise from the common area bled into the hot desks",
  "the coffee machine was out of order for over a week",
  "housekeeping only showed up once and it wasn't enough",
  "the locker keys went missing more than once",
];
function buildBody(rating, usedBodies) {
  const sentiment = sentimentFor(rating);
  for (let i = 0; i < 150; i++) {
    let body;
    if (sentiment === "positive") {
      const a = OBS_POSITIVE[Math.floor(Math.random() * OBS_POSITIVE.length)];
      let b = OBS_POSITIVE[Math.floor(Math.random() * OBS_POSITIVE.length)];
      while (b === a) b = OBS_POSITIVE[Math.floor(Math.random() * OBS_POSITIVE.length)];
      body = `Been using this space for a few months now — ${a}, and ${b}. Would recommend to other teams looking nearby.`;
    } else if (sentiment === "negative") {
      const a = OBS_NEGATIVE[Math.floor(Math.random() * OBS_NEGATIVE.length)];
      let b = OBS_NEGATIVE[Math.floor(Math.random() * OBS_NEGATIVE.length)];
      while (b === a) b = OBS_NEGATIVE[Math.floor(Math.random() * OBS_NEGATIVE.length)];
      body = `Tried this space for a few weeks and it didn't quite work out — ${a}, and ${b}. Probably won't renew.`;
    } else {
      const a = OBS_POSITIVE[Math.floor(Math.random() * OBS_POSITIVE.length)];
      const b = OBS_NEGATIVE[Math.floor(Math.random() * OBS_NEGATIVE.length)];
      body = `Used this space for a few weeks — ${a}, but ${b}. Overall it did what we needed for the price.`;
    }
    if (!usedBodies.has(body)) {
      usedBodies.add(body);
      return body;
    }
  }
  throw new Error("ran out of unique review bodies for sentiment " + sentiment);
}

function randomPastDate(maxDaysAgo) {
  // Weighted toward more recent dates (sqrt skews the distribution younger).
  const days = Math.floor(Math.sqrt(Math.random()) * maxDaysAgo);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

const LARGE_BRANDS = ["wework", "awfis", "regus", "smartworks", "innov8", "indiqube", "91springboard"];
function reviewCountFor(brand) {
  const isLarge = LARGE_BRANDS.includes(brand.toLowerCase());
  return isLarge ? 18 + Math.floor(Math.random() * 8) : 10 + Math.floor(Math.random() * 5);
}

async function fetchExistingSets() {
  const fetchAll = async (table, col) => {
    let out = [];
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.from(table).select(col).range(offset, offset + 999);
      if (error) throw error;
      out = out.concat(data);
      if (data.length < 1000) break;
      offset += 1000;
    }
    return out;
  };
  const names = await fetchAll("profiles", "display_name");
  const titles = await fetchAll("reviews", "title");
  return {
    usedNames: new Set(names.map((r) => r.display_name)),
    usedTitles: new Set(titles.map((r) => r.title).filter(Boolean)),
    usedBodies: new Set(),
    usedDescs: new Set(),
  };
}

async function generateReviews(spaceId, spaceName, brand, state) {
  const reviewCount = reviewCountFor(brand);
  // Rating distribution skews positive (like a real, decent space) but
  // includes some 3s and the occasional 1-2 for authenticity.
  const RATING_WEIGHTS = [1, 1, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5];
  // Headline/body uniqueness is scoped per-space (what a visitor to this
  // page actually sees) — reviewer names stay globally unique via state.
  const usedTitles = new Set();
  const usedBodies = new Set();
  let ok = 0;
  for (let i = 0; i < reviewCount; i++) {
    const displayName = pickReviewerName(state.usedNames);
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .insert({ display_name: displayName, is_verified_coworker: true })
      .select("id")
      .single();
    if (profErr) {
      console.error(`Profile insert failed for ${displayName}:`, profErr.message);
      continue;
    }

    const overall = RATING_WEIGHTS[Math.floor(Math.random() * RATING_WEIGHTS.length)];
    const jitter = () => Math.max(1, Math.min(5, overall + Math.round(Math.random() * 2 - 1)));
    const title = buildHeadline(overall, usedTitles);
    const body = buildBody(overall, usedBodies);
    const created_at = randomPastDate(540).toISOString(); // spread over ~18 months

    const { error: revErr } = await supabase.from("reviews").insert({
      space_id: spaceId,
      profile_id: profile.id,
      rating_overall: overall,
      rating_wifi: jitter(),
      rating_quiet: jitter(),
      rating_community: jitter(),
      rating_coffee: jitter(),
      rating_value: jitter(),
      title,
      body,
      created_at,
    });
    if (revErr) {
      console.error(`Review insert failed for ${spaceName} / ${displayName}:`, revErr.message);
      continue;
    }
    ok++;
  }
  return ok;
}

async function wipeReviews(spaceId) {
  const { data: existingReviews } = await supabase.from("reviews").select("id,profile_id").eq("space_id", spaceId);
  if (!existingReviews?.length) return;
  const profileIds = existingReviews.map((r) => r.profile_id);
  await supabase.from("reviews").delete().eq("space_id", spaceId);
  await supabase.from("profiles").delete().in("id", profileIds);
}

async function main() {
  const { data: noida, error: cityErr } = await supabase.from("cities").select("id,name").eq("name", "Noida").single();
  if (cityErr || !noida) throw new Error(`Could not resolve Noida city: ${cityErr?.message}`);

  const state = await fetchExistingSets();
  console.log(`Loaded ${state.usedNames.size} existing reviewer names, ${state.usedTitles.size} existing review titles.`);

  let inserted = 0;
  let regenerated = 0;
  for (const raw of RAW_SPACES) {
    if (EXCLUDED_BRANDS.some((b) => raw.name.toLowerCase().includes(b) || raw.brand.toLowerCase().includes(b))) {
      console.log(`Skipping excluded brand: ${raw.name}`);
      continue;
    }

    const slug = slugify(`${raw.name}-${raw.locality}-noida`);
    const { data: existing } = await supabase.from("spaces").select("id").eq("slug", slug).maybeSingle();

    let spaceId;
    if (existing) {
      spaceId = existing.id;
      await wipeReviews(spaceId);
      const description = buildDescription(raw.name, raw.locality, "Noida", state.usedDescs);
      const { error: updErr } = await supabase.from("spaces").update({ description }).eq("id", spaceId);
      if (updErr) console.error(`Description update failed for ${raw.name}:`, updErr.message);
      regenerated++;
    } else {
      const description = buildDescription(raw.name, raw.locality, "Noida", state.usedDescs);
      const amenities = pickAmenities();
      const vibe_tags = pickVibeTags();
      const cover_url = FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];

      const { data: spaceRow, error: insErr } = await supabase
        .from("spaces")
        .insert({
          slug,
          name: raw.name,
          city_id: noida.id,
          address: `${raw.locality}, Noida`,
          price_from: raw.price,
          currency: "INR",
          amenities,
          vibe_tags,
          cover_url,
          description,
          is_published: true,
        })
        .select("id")
        .single();

      if (insErr) {
        console.error(`Insert failed for ${raw.name}:`, insErr.message);
        continue;
      }
      spaceId = spaceRow.id;
      inserted++;
    }

    const count = await generateReviews(spaceId, raw.name, raw.brand, state);
    console.log(`${existing ? "Regenerated" : "Inserted"} ${raw.name} (${raw.locality}) with ${count} reviews.`);
  }

  console.log(`Done. ${inserted} spaces inserted, ${regenerated} spaces' reviews regenerated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
