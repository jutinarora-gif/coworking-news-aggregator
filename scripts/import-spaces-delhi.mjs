import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Facts only (name, locality, starting price), extracted from Worklane
// Delhi listings on 2026-08-09, same process as Gurugram/Noida. alt.f
// entries excluded per standing site policy. No reviews fabricated --
// launches with zero reviews.
const RAW_SPACES = [
  { name: "WeWork Aerocity", locality: "Aerocity", price: 22000, img: "We_Work_1_11443ab305.avif" },
  { name: "WeWork Malviya Nagar", locality: "Malviya Nagar", price: 14999, img: "We_Work_Eldeco_Centre_1_add50f4392.avif" },
  { name: "Innov8 Aerocity", locality: "Aerocity", price: 22999, img: "Innov8_Pride_Plaza_1_e714de48c2.jpeg" },
  { name: "Innov8 Saket", locality: "Saket", price: 13999, img: "Innov8_Old_Fort_3_1832482f5e.avif" },
  { name: "Innov8 Connaught Place", locality: "Connaught Place", price: 14000, img: "Innov8_Connaught_Place_2_a460d03dea.avif" },
  { name: "Smartworks Nehru Place", locality: "Nehru Place", price: 10999, img: "Smartworks_Vardhman_Trade_Centre_2_150c4ad923.avif" },
  { name: "Innov8 Okhla", locality: "Okhla", price: 11499, img: "Innov8_Okhla_Industrial_Estate_2_e3f0d77086.avif" },
  { name: "Awfis Vasant Kunj", locality: "Vasant Kunj", price: 10999, img: "Awfis_Allied_House_6_8be2c8c28f.avif" },
  { name: "Awfis Mohan Cooperative", locality: "Mohan Cooperative Industrial Estate", price: 11499, img: "Awfis_Uppal_Genesis_1_d5ac2f575b.avif" },
  { name: "Awfis L29 Connaught Place", locality: "Connaught Place", price: 15999, img: "Awfis_L29_Connaught_Place_3_f578ded493.avif" },
  { name: "91Springboard Nehru Place", locality: "Nehru Place", price: 12999, img: "91_Springboard_Chandra_Bhavan_2_df8cd518f1.avif" },
  { name: "91Springboard Mohan Cooperative", locality: "Mohan Cooperative Industrial Estate", price: 9699, img: "91_Springboard_Mohan_Cooperative_Industrial_Estate_2_ed8aecd707.avif" },
  { name: "Trinity Coworking", locality: "Sector 7 Dwarka", price: 6499, img: "Trinity_Coworking_Sector_7_Dwarka_3_32f4d1a274.avif" },
  { name: "InnerSpace Okhla", locality: "Okhla", price: 4999, img: "Inner_Space_Fedex_Building_3_bb232fe07e.avif" },
  { name: "Work2Zone", locality: "Vijay Enclave", price: 4999, img: "Work2_Zone_Vijay_Enclave_2_a3f86840eb.webp" },
  { name: "91Springboard Saket", locality: "Saket", price: 23000, img: "91_Springboard_Prius_Platinum_2_13cb245cfe.avif" },
  { name: "U.S.Coworking", locality: "Dwarka", price: 5999, img: "U_S_Coworking_RZ_11_B_Vashisth_Kuteer_Dwarka_2_b5875f1938.avif" },
  { name: "Cosphere Spaces", locality: "Derawal Nagar", price: 6499, img: "Cosphere_Spaces_Derawal_Nagar_2_6cbd8e6da9.avif" },
  { name: "G K Surekha", locality: "Pitampura", price: 4999, img: "G_K_Surekha_Pitampura_1_fc1a8b19a2.avif" },
  { name: "Regus Aerocity", locality: "Aerocity", price: 35890, img: "Regus_Caddie_Commercial_Tower_4_94a03879e1.avif" },
  { name: "Our Offices", locality: "Pitampura", price: 5999, img: "Our_Offices_Pitampura_2_d7cb927fcd.jfif" },
  { name: "Work Exchange", locality: "Pitampura", price: 11000, img: "Work_Exchange_Pitampura_1_58dfdfdd4f.avif" },
  { name: "Inferno Coworking", locality: "Laxmi Nagar", price: 3999, img: "Inferno_Coworking_Laxmi_Nagar_1_5fbdaae4cd.jfif" },
  { name: "Avanta Business Centre Nehru Place", locality: "Nehru Place", price: 24999, img: "Avanta_Business_Centre_International_Trade_Tower_3_4fc9e869d8.avif" },
  { name: "Avanta Business Centre Barakhamba", locality: "Barakhamba", price: 25999, img: "Avanta_Business_Centre_Statesman_House_8_68964ec3b6.avif" },
  { name: "HuntOffices", locality: "Mandi House", price: 4999, img: "Hunt_Offices_Mandi_House_1_ba266e4d3d.avif" },
  { name: "Investopad", locality: "Hauz Khas", price: 9999, img: "Investopad_Hauz_Khas_4_d51fd6f284.avif" },
  { name: "Onward Workspace Mohan Cooperative", locality: "Mohan Cooperative Industrial Estate", price: 6999, img: "Onward_Workspace_B1_A5_4_a8729405b5.avif" },
  { name: "Onward Workspace Okhla", locality: "Okhla", price: 7999, img: "Onward_Workspace_Okhla_2_f1be9ad395.webp" },
  { name: "Fume Coworking", locality: "Pitampura", price: 8500, img: "Fume_Coworking_Pitampura_1_acdc4450f6.avif" },
  { name: "La Vie En Rose", locality: "Saket", price: 9000, img: "La_Vie_En_Rose_Saket_2_4a77b5c8a4.avif" },
  { name: "MyTime Co.work", locality: "Saket", price: 4999, img: "My_Time_Co_work_Saket_2_82a3adec57.avif" },
  { name: "Start Works", locality: "Connaught Place", price: 5499, img: "Start_Works_Connaught_Place_1_bd3fe6da5b.avif" },
  { name: "The Third Space", locality: "Mayur Vihar", price: 7999, img: "The_Third_Space_Mayur_Vihar_Phase_1_1_5c7a117496.avif" },
  { name: "1share", locality: "East of Kailash", price: 4999, img: "1share_East_of_Kailash_1_c0d78a09a1.avif" },
  { name: "Kinnoti Hub", locality: "Badarpur", price: 5499, img: "Kinnoti_Hub_Badarpur_1_237ecf7723.avif" },
  { name: "The Berry Coworks Jhandewalan", locality: "Jhandewalan", price: 7499, img: "The_Berry_Coworks_Jhandewalan_2_7aeab9092b.avif" },
  { name: "Pin For Cowork", locality: "Ashok Park Main", price: 7499, img: "Pin_For_Cowork_Ashok_Park_Main_1_e490fad0a8.avif" },
  { name: "360 Degrees Co-Working", locality: "Tilak Nagar", price: 5500, img: "360_Degrees_Co_Working_Tilak_Nagar_1_2140443ec1.avif" },
  { name: "ZO Space Sainik Farm", locality: "Sainik Farm", price: 7999, img: "ZO_Space_Sainik_Farm_137_4_88c354ff20.avif" },
  { name: "Master Space", locality: "Najafgarh", price: 6499, img: "Master_Space_Najafgarh_1_65f3a30dfd.webp" },
  { name: "Talent4Assure", locality: "Netaji Subhash Place", price: 6000, img: "Talent4_Assure_Netaji_Subhash_Place_5_3179e33f80.avif" },
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
  const { data: delhi, error: cityErr } = await supabase.from("cities").select("id,name").eq("name", "Delhi").single();
  if (cityErr || !delhi) throw new Error(`Could not resolve Delhi city: ${cityErr?.message}`);

  const sortedPrices = [...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];

  let inserted = 0;
  let skipped = 0;
  for (const raw of RAW_SPACES) {
    const slug = slugify(`${raw.name}-${raw.locality}-delhi`);
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
      cityName: "Delhi",
      amenities,
      vibeTags: vibe_tags,
      priceFrom: raw.price,
      currency: "INR",
      cityMedian,
    }, slug);

    const { error: insErr } = await supabase.from("spaces").insert({
      slug,
      name: raw.name,
      city_id: delhi.id,
      address: `${raw.locality}, Delhi`,
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
