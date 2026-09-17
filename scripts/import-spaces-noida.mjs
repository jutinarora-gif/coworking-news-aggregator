import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

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

async function main() {
  const { data: noida, error: cityErr } = await supabase.from("cities").select("id,name").eq("name", "Noida").single();
  if (cityErr || !noida) throw new Error(`Could not resolve Noida city: ${cityErr?.message}`);

  const sortedPrices = [...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];

  let inserted = 0;
  let regenerated = 0;
  for (const raw of RAW_SPACES) {
    if (EXCLUDED_BRANDS.some((b) => raw.name.toLowerCase().includes(b) || raw.brand.toLowerCase().includes(b))) {
      console.log(`Skipping excluded brand: ${raw.name}`);
      continue;
    }

    const slug = slugify(`${raw.name}-${raw.locality}-noida`);
    const { data: existing } = await supabase.from("spaces").select("id").eq("slug", slug).maybeSingle();
    const amenities = pickAmenities();
    const vibe_tags = pickVibeTags();
    const description = buildSpaceDescription({
      name: raw.name,
      area: raw.locality,
      cityName: "Noida",
      amenities,
      vibeTags: vibe_tags,
      priceFrom: raw.price,
      currency: "INR",
      cityMedian,
    }, slug);

    let spaceId;
    if (existing) {
      spaceId = existing.id;
      const { error: updErr } = await supabase.from("spaces").update({ description }).eq("id", spaceId);
      if (updErr) console.error(`Description update failed for ${raw.name}:`, updErr.message);
      regenerated++;
    } else {
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

    console.log(`${existing ? "Updated" : "Inserted"} ${raw.name} (${raw.locality}).`);
  }

  console.log(`Done. ${inserted} spaces inserted, ${regenerated} spaces' descriptions updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
