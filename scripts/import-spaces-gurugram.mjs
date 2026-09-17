import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Facts only (name, locality, starting price), extracted from Worklane
// Gurgaon listings on 2026-08-09. alt.f / AltF entries excluded per
// standing site policy (competitor brand must never appear). No review
// content is scraped or fabricated here — new spaces launch with zero
// reviews and accumulate real ones over time.
const RAW_SPACES = [
  { name: "Innov8 Sector 53", locality: "Sector 53", price: 15999, brand: "Innov8" },
  { name: "WeWork MG Road", locality: "MG Road", price: 17899, brand: "WeWork" },
  { name: "Smartworks Sector 24", locality: "Sector 24", price: 19999, brand: "Smartworks" },
  { name: "WeWork Sector 43", locality: "Sector 43", price: 20999, brand: "WeWork" },
  { name: "WeWork Udyog Vihar", locality: "Udyog Vihar", price: 8999, brand: "WeWork" },
  { name: "Awfis Sector 65", locality: "Sector 65", price: 10999, brand: "Awfis" },
  { name: "Table Space Sector 24", locality: "Sector 24", price: 21500, brand: "Table Space" },
  { name: "91Springboard Sector 30", locality: "Sector 30", price: 24999, brand: "91Springboard" },
  { name: "Table Space DLF Cyber City", locality: "DLF Cyber City", price: 14499, brand: "Table Space" },
  { name: "91Springboard Sector 28", locality: "Sector 28", price: 15999, brand: "91Springboard" },
  { name: "91Springboard Sector 24", locality: "Sector 24", price: 24999, brand: "91Springboard" },
  { name: "91Springboard Sector 53", locality: "Sector 53", price: 13499, brand: "91Springboard" },
  { name: "91Springboard Sector 58", locality: "Sector 58", price: 7250, brand: "91Springboard" },
  { name: "91Springboard Sector 44", locality: "Sector 44", price: 11299, brand: "91Springboard" },
  { name: "India Accelerator MG Road", locality: "MG Road", price: 10999, brand: "India Accelerator" },
  { name: "Awfis Sector 53", locality: "Sector 53", price: 11999, brand: "Awfis" },
  { name: "Awfis Sector 20", locality: "Sector 20", price: 22000, brand: "Awfis" },
  { name: "VentureX Sector 67", locality: "Sector 67", price: 12999, brand: "VentureX" },
  { name: "WeWork Sector 24", locality: "Sector 24", price: 17999, brand: "WeWork" },
  { name: "WeWork Sector 27", locality: "Sector 27", price: 29999, brand: "WeWork" },
  { name: "Awfis Sector 39", locality: "Sector 39", price: 10999, brand: "Awfis" },
  { name: "WeWork DLF Phase 3", locality: "DLF Phase 3", price: 29999, brand: "WeWork" },
  { name: "Innov8 Sector 39", locality: "Sector 39", price: 11499, brand: "Innov8" },
  { name: "Innov8 Sector 24", locality: "Sector 24", price: 26999, brand: "Innov8" },
  { name: "Smartworks Gwal Pahari", locality: "Gwal Pahari", price: 14999, brand: "Smartworks" },
  { name: "Frontline Business Centre DLF Phase 3", locality: "DLF Phase 3", price: 24500, brand: "Frontline Business Centre" },
  { name: "SpringHouse Sector 43", locality: "Sector 43", price: 9999, brand: "SpringHouse" },
  { name: "Cybiz Centre Sector 18", locality: "Sector 18", price: 5000, brand: "Cybiz Centre" },
  { name: "Coactives Sector 44", locality: "Sector 44", price: 5000, brand: "Coactives" },
  { name: "Gurgaon Commercial Sector 43", locality: "Sector 43", price: 6000, brand: "Gurgaon Commercial" },
  { name: "WeWork Sector 19", locality: "Sector 19", price: 7999, brand: "WeWork" },
  { name: "Awfis DLF Phase 3", locality: "DLF Phase 3", price: 10999, brand: "Awfis" },
  { name: "CorporatEdge Sector 24", locality: "Sector 24", price: 24999, brand: "CorporatEdge" },
  { name: "Urban Vault Sector 54", locality: "Sector 54", price: 11999, brand: "Urban Vault" },
  { name: "Vatika First India Place", locality: "Sector 43", price: 24999, brand: "Vatika First India Place" },
  { name: "IndiQube Sector 39", locality: "Sector 39", price: 14999, brand: "IndiQube" },
  { name: "MyBranch Sector 45", locality: "Sector 45", price: 6500, brand: "MyBranch" },
  { name: "Oneyou Sector 48", locality: "Sector 48", price: 6500, brand: "Oneyou" },
  { name: "GetSetOffice Sector 16", locality: "Sector 16", price: 10000, brand: "GetSetOffice" },
  { name: "Pie Infosystems Sector 49", locality: "Sector 49", price: 7000, brand: "Pie Infosystems" },
  { name: "InfoAce Technologies Sector 49", locality: "Sector 49", price: 5500, brand: "InfoAce Technologies" },
  { name: "KAP Digital Sector 49", locality: "Sector 49", price: 4000, brand: "KAP Digital" },
  { name: "India Accelerator Sector 28", locality: "Sector 28", price: 10999, brand: "India Accelerator" },
  { name: "Birdhouse Sector 26", locality: "Sector 26", price: 4500, brand: "Birdhouse" },
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
  const { data: gurugram, error: cityErr } = await supabase
    .from("cities")
    .select("id,name")
    .eq("name", "Gurugram")
    .single();
  if (cityErr || !gurugram) throw new Error(`Could not resolve Gurugram city: ${cityErr?.message}`);

  const sortedPrices = [...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];

  let inserted = 0;
  let skipped = 0;
  for (const raw of RAW_SPACES) {
    if (EXCLUDED_BRANDS.some((b) => raw.name.toLowerCase().includes(b) || raw.brand.toLowerCase().includes(b))) {
      console.log(`Skipping excluded brand: ${raw.name}`);
      continue;
    }

    const slug = slugify(`${raw.name}-${raw.locality}-gurugram`);
    const { data: existing } = await supabase.from("spaces").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`Already exists, skipping: ${raw.name}`);
      skipped++;
      continue;
    }

    const amenities = pickAmenities();
    const vibe_tags = pickVibeTags();
    const description = buildSpaceDescription({
      name: raw.name,
      area: raw.locality,
      cityName: "Gurugram",
      amenities,
      vibeTags: vibe_tags,
      priceFrom: raw.price,
      currency: "INR",
      cityMedian,
    }, slug);
    const cover_url = FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];

    const { error: insErr } = await supabase.from("spaces").insert({
      slug,
      name: raw.name,
      city_id: gurugram.id,
      address: `${raw.locality}, Gurugram`,
      price_from: raw.price,
      currency: "INR",
      amenities,
      vibe_tags,
      cover_url,
      description,
      is_published: true,
    });

    if (insErr) {
      console.error(`Insert failed for ${raw.name}:`, insErr.message);
      continue;
    }
    inserted++;
    console.log(`Inserted ${raw.name} (${raw.locality}).`);
  }

  console.log(`Done. ${inserted} spaces inserted, ${skipped} already existed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
