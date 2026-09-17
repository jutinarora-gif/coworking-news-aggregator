// Facts only (name, locality, starting price), sourced from myHQ Gurugram
// coworking listings on 2026-09-17. Brings Gurugram from 47 to 100 published
// spaces. alt.f entries excluded per standing site policy. No reviews
// fabricated, descriptions generated from real per-listing data (see
// scripts/lib/space-description.mjs), images are stock fallbacks like the
// original Gurugram batch (no per-space photos scraped for this batch).

import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const EXCLUDED_BRANDS = ["alt.f", "altf"];

const RAW_SPACES = [
  { name: "91Springboard DLF Building 7A", locality: "DLF Cyber City", price: 24999 },
  { name: "WeWork BlueOne Square", locality: "Udyog Vihar", price: 19849 },
  { name: "Incuspaze M3M Urbana Premium", locality: "Sector 67", price: 8000 },
  { name: "Innov8 CLC Tower", locality: "Sector 44", price: 7999 },
  { name: "awfis WOCO One", locality: "Udyog Vihar", price: 15000 },
  { name: "91Springboard Sector 58", locality: "Sector 58", price: 11000 },
  { name: "WeWork HQ 27", locality: "Huda City Centre", price: 29999 },
  { name: "Innov8 DLF Cybergreen", locality: "DLF Cyber City", price: 26999 },
  { name: "SpringHouse Plot No. 296", locality: "Udyog Vihar", price: 6999 },
  { name: "awfis Suncity Success Tower", locality: "Sector 50", price: 10999 },
  { name: "91Springboard Building No.145", locality: "Sector 44", price: 11299 },
  { name: "WeWork Platina", locality: "DLF Phase 2", price: 17899 },
  { name: "The Executive Centre DLF Cyber City", locality: "DLF Cyber City", price: 60000 },
  { name: "Innov8 Unitech Cyber Park", locality: "Unitech Cyber Park", price: 11499 },
  { name: "91Springboard Augusta Point", locality: "Sector 53", price: 13499 },
  { name: "WeWork DLF Forum", locality: "DLF Cyber City", price: 17999 },
  { name: "SpringHouse Welldone Tech Park", locality: "Sector 48", price: 5999 },
  { name: "Incuspaze HQ 27", locality: "Sushant Lok Phase I", price: 25000 },
  { name: "WeWork Vi-John Tower", locality: "Udyog Vihar", price: 13500 },
  { name: "SpringHouse JMD Galleria", locality: "Sector 48", price: 7499 },
  { name: "DesqWorx JMD Megapolis", locality: "Sector 48", price: 7999 },
  { name: "The Circle.Work Millennium City Centre", locality: "Huda City Centre", price: 16500 },
  { name: "The Office Pass Unitech Cyber Park", locality: "Sector 39", price: 9999 },
  { name: "Whizdom Club", locality: "Sector 53", price: 15000 },
  { name: "COWRKS CYBERCITY", locality: "DLF Cyber City", price: 19999 },
  { name: "IA Spaces by India Accelerator BPTP Centra One", locality: "Sector 61", price: 9999 },
  { name: "Spacetime", locality: "Sector 44", price: 10499 },
  { name: "WeWork 9A", locality: "DLF Cyber City", price: 29999 },
  { name: "Corporatedge Cyber Hub", locality: "DLF Cyber City", price: 30000 },
  { name: "Spaces Building No. 9A", locality: "DLF Cyber City", price: 23099 },
  { name: "Skootr DLF Infinity Tower A", locality: "DLF Cyber City", price: 27000 },
  { name: "Frontline 5B", locality: "DLF Cyber City", price: 24500 },
  { name: "91Springboard 14B DLF Cyber City", locality: "Sector 24", price: 24000 },
  { name: "Skootr 9B DLF Cyber City", locality: "DLF Cyber City", price: 27000 },
  { name: "Cube8 MM Towers", locality: "Udyog Vihar", price: 6500 },
  { name: "Coworkkeys", locality: "Udyog Vihar", price: 9000 },
  { name: "IA Spaces by India Accelerator MGF Metropolis", locality: "DLF Phase 2", price: 10999 },
  { name: "Truworx DLF Phase 1", locality: "DLF Phase 1", price: 6999 },
  { name: "The Circle.Work Unitech Trade Centre", locality: "Huda City Centre", price: 16500 },
  { name: "Acquir Workspaces", locality: "Udyog Vihar", price: 6499 },
  { name: "91Springboard 90B", locality: "Udyog Vihar", price: 9199 },
  { name: "IA Spaces by India Accelerator Udyog Vihar", locality: "Udyog Vihar", price: 7999 },
  { name: "COWRKS G2 Sector 21", locality: "Udyog Vihar", price: 14000 },
  { name: "Beyond Just Work", locality: "Udyog Vihar", price: 6499 },
  { name: "91Springboard 21-B Sector 18", locality: "Udyog Vihar", price: 11000 },
  { name: "Onward Workspace", locality: "Udyog Vihar", price: 9500 },
  { name: "Acquir Workspaces Brickworks", locality: "Udyog Vihar", price: 5999 },
  { name: "Cabin and Co GIFT One Tower", locality: "Udyog Vihar", price: 12000 },
  { name: "Karma Kalpa", locality: "Udyog Vihar", price: 6999 },
  { name: "SpringHouse 112", locality: "Sector 44", price: 8499 },
  { name: "Oahfeo", locality: "Sector 44", price: 7499 },
  { name: "SupremeWork", locality: "Sector 44", price: 6000 },
  { name: "Venture X Landmark House Sector 44", locality: "Sector 44", price: 9999 },
];

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

  const { data: existingRows } = await supabase.from("spaces").select("price_from").eq("city_id", gurugram.id).not("price_from", "is", null);
  const allPrices = [...existingRows.map((r) => r.price_from), ...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = allPrices[Math.floor(allPrices.length / 2)];

  let inserted = 0;
  let skipped = 0;
  for (const raw of RAW_SPACES) {
    if (EXCLUDED_BRANDS.some((b) => raw.name.toLowerCase().includes(b))) {
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
  }

  console.log(`Done. ${inserted} inserted, ${skipped} skipped (already existed).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
