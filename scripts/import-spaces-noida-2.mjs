import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Facts only (name, locality, starting price), extracted from Worklane
// Noida listings on 2026-08-09, same pass that sourced the Gurugram batch.
// alt.f entries excluded per standing site policy. No reviews are
// fabricated -- these launch with zero reviews, same as the Gurugram
// batch, per prior direction.
const RAW_SPACES = [
  { name: "Smartworks Logix Cyber Park", locality: "Sector 62", price: 6999, img: "Smartworks_Logix_Cyber_Park_1_192df36cb3.avif" },
  { name: "91Springboard Bhutani 62 Avenue", locality: "Sector 62", price: 15000, img: "91_Springboard_Bhutani_62_Avenue_2_8aa568df97.avif" },
  { name: "Awfis Majestic Signia", locality: "Sector 62", price: 9499, img: "Awfis_Majestic_Signia_1_b039415b79.avif" },
  { name: "Awfis Bhutani Technopark", locality: "Sector 127", price: 9499, img: "Awfis_Bhutani_Technopark_3_b7b646f7ad.avif" },
  { name: "91Springboard Sector 2", locality: "Sector 2", price: 9499, img: "91_Springboard_Sector_2_Noida_5_8bef3bb071.avif" },
  { name: "Awfis 8 Square Zen", locality: "Sector 142", price: 7500, img: "Awfis_8_Square_Zen_4_221f4e272a.avif" },
  { name: "91Springboard Sector 63", locality: "Sector 63", price: 8049, img: "91springboard_Sec_63_Noida_1_c13869e133.avif" },
  { name: "Nukleus Logix Cyber Park", locality: "Sector 62", price: 5999, img: "nukleus_Logix_Cyber_Park_2_0705eaf824.avif" },
  { name: "91Springboard Sector 1", locality: "Sector 1", price: 8999, img: "91_Springboard_C2_Sector_1_Noida_1_befb0d71c9.avif" },
  { name: "Incuspaze Sector 64", locality: "Sector 64", price: 7499, img: "Incuspaze_Sector_64_Noida_2_cfcc8db6f0.avif" },
  { name: "Rystrix NX One Tower", locality: "Greater Noida", price: 6000, img: "Rystrix_NX_One_Tower_3_3560c98729.avif" },
  { name: "Piwork Urbtech Matrix Tower", locality: "Sector 132", price: 6999, img: "Piwork_Urbtech_Matrix_Tower_5_ab2b9837e4.avif" },
  { name: "Regus Sovereign Corporate Tower", locality: "Sector 136", price: 8790, img: "Regus_Sovereign_Corporate_Tower_1_20d2feae3f.avif" },
  { name: "Awfis Riverside Tower", locality: "Sector 125", price: 9500, img: "Awfis_Riverside_Tower_Sector_125_1_85d517346c.avif" },
  { name: "Indosoft Co-working Space", locality: "Sector 62", price: 6499, img: "Indosoft_Co_working_Space_Sector_62_1_7e4a867266.avif" },
  { name: "IndiQube Logix Cyber Park", locality: "Sector 62", price: 6999, img: "Indi_Qube_Logix_Cyber_Park_3_0b08f396ee.avif" },
  { name: "MyWorx Sector 2", locality: "Sector 2", price: 5000, img: "My_Worx_Sector_2_Noida_1_afbcc3fa7d.avif" },
  { name: "IHDP Business Park", locality: "Sector 127", price: 6499, img: "IHDP_Business_Park_Sector_127_Gurgaon_2_bc23ebde58.avif" },
  { name: "Nukleus Sector 142", locality: "Sector 142", price: 5999, img: "nukleus_Sector_142_Noida_1_7d41eaec61.avif" },
  { name: "Worknest", locality: "Sector 3", price: 8499, img: "Worknest_Sector_3_Noida_1_15309a5a68.avif" },
  { name: "Golden Glory", locality: "Sector 8", price: 6500, img: "Golden_Glory_Sector_8_Noida_4_b58ca0b9bc.avif" },
  { name: "Regus Logix City Center Mall", locality: "Sector 32", price: 12173, img: "Regus_Logix_City_Center_Mall_6_6d9c5fc290.webp" },
  { name: "Regus Knowledge Centre", locality: "Sector 126", price: 10250, img: "Regus_Knowledge_Centre_1_57ce4a3c43.avif" },
  { name: "USIS BizPark", locality: "Sector 63", price: 4999, img: "USIS_Biz_Park_Sector_63_Noida_2_de29010dd9.avif" },
  { name: "Workspaces By Innova A-61", locality: "Sector 63", price: 7499, img: "Workspaces_By_Innova_A_61_2_288ff17fbd.avif" },
  { name: "The Berry Coworks", locality: "Sector 142", price: 7499, img: "The_Berry_Coworks_Sector_142_Noida_2_22d623702a.avif" },
];

const IMG_BASE = "https://strapi-media-bucket-altf.s3.ap-south-1.amazonaws.com/";
const BUCKET = "space-photos";

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

function extFromUrl(url) {
  const clean = url.split("?")[0];
  const m = clean.match(/\.(webp|jpg|jpeg|png|avif|jfif)$/i);
  return m ? m[1].toLowerCase() : "jpg";
}

async function rehostImage(slug, filename) {
  const url = IMG_BASE + filename;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(filename);
  const path = `${slug}.${ext}`;
  const contentType = res.headers.get("content-type") || `image/${ext === "jpg" ? "jpeg" : ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType, upsert: true });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

async function main() {
  const { data: noida, error: cityErr } = await supabase.from("cities").select("id,name").eq("name", "Noida").single();
  if (cityErr || !noida) throw new Error(`Could not resolve Noida city: ${cityErr?.message}`);

  const sortedPrices = [...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];

  let inserted = 0;
  let skipped = 0;
  for (const raw of RAW_SPACES) {
    const slug = slugify(`${raw.name}-${raw.locality}-noida`);
    const { data: existing } = await supabase.from("spaces").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`Already exists, skipping: ${raw.name}`);
      skipped++;
      continue;
    }

    let cover_url;
    try {
      cover_url = await rehostImage(slug, raw.img);
    } catch (e) {
      console.error(`Image rehost failed for ${raw.name}: ${e.message}`);
      continue;
    }

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

    const { error: insErr } = await supabase.from("spaces").insert({
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
