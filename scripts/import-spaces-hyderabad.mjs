import { createClient } from "@supabase/supabase-js";
import { buildSpaceDescription } from "./lib/space-description.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Facts only (name, locality, starting price), extracted from Cofynd
// Hyderabad listings (Hitec City, Gachibowli, Madhapur pages) on
// 2026-08-09 -- Worklane doesn't cover Hyderabad. Same process as prior
// cities: no reviews fabricated, images re-hosted on our own storage,
// no watermark (verified in an earlier pass this session).
const RAW_SPACES = [
  // Hitec City
  { name: "Awfis Sarvotham", locality: "Hitec City", price: 10999, img: "https://img.cofynd.com/images/latest_images_2024/6550955a4036fbd826282f0d13e5cac04240f9c0.webp" },
  { name: "InDesk", locality: "Hitec City", price: 5000, img: "https://img.cofynd.com/images/original/be28b9b179f67147fca0fb6e5bab8fe323184238.jpg" },
  { name: "Smartworks Purva Summit", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/latest_images_2024/34ebf452868aa1f6910affff8f5743e4b5538157.webp" },
  { name: "iSprout Orbit", locality: "Hitec City", price: 12499, img: "https://img.cofynd.com/images/latest_images_2024/5f3abdd1acaa430bdc0e9984754c421358d55204.webp" },
  { name: "Regus iLabs Centre", locality: "Hitec City", price: 9499, img: "https://img.cofynd.com/images/latest_images_2024/e7b63da2a873bfd28604a3237a4b7aa8c189ec83.webp" },
  { name: "The Executive Center RMZ Nexity", locality: "Hitec City", price: 59999, img: "https://img.cofynd.com/images/latest_images_2024/76abdb9cab590f9468a69c138eed561c60d10da7.webp" },
  { name: "Awfis Tech One", locality: "Hitec City", price: 10999, img: "https://img.cofynd.com/images/latest_images_2024/f05c442fb4c139ec755a22b8119ac448b9e2c390.webp" },
  { name: "Rent A desk", locality: "Madhapur", price: 7999, img: "https://img.cofynd.com/images/original/2ec75522dc663221e031b69426504ba8135f0eb9.jpg" },
  { name: "Awfis Aurobindo Orbit", locality: "Hitec City", price: 10999, img: "https://img.cofynd.com/images/latest_images_2024/4c3051c1e797fba6c305acdee898154468f0ed3c.webp" },
  { name: "iSprout My Home Twitza", locality: "Hitec City", price: 11499, img: "https://img.cofynd.com/images/latest_images_2024/e230676e36e9daf6a82a50a3215135926ffde6b2.webp" },
  { name: "Smartworks Aurobindo Galaxy", locality: "Hitec City", price: 10999, img: "https://img.cofynd.com/images/latest_images_2024/8cd244e8d95110d351e93a83052117805cc3fb6e.webp" },
  { name: "Awfis N Heights", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/original/075b26030a27776888bfb4e4afd3447950263b0f.jpg" },
  { name: "iKeva iLabs Centre", locality: "Hitec City", price: 11999, img: "https://img.cofynd.com/images/latest_images_2024/7b4b26482f146e15e1d7bcba5dbe6a28fc4459ee.webp" },
  { name: "iSprout Purva Summit", locality: "Hitec City", price: 5999, img: "https://img.cofynd.com/images/original/2578e1fb09706b1bc10948edfe3f7d16b35db69e.jpg" },
  { name: "Awfis Laxmi Cyber City", locality: "Hitec City", price: 8499, img: "https://img.cofynd.com/images/latest_images_2024/c2d2f12db4cf5ff4a1ba95b0d8ae2f52728d128e.webp" },
  { name: "CoKarma", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/latest_images_2024/90edceea04ce07df7383c3583fb23c82914cacf2.webp" },
  { name: "Awfis Ohris Tech Park", locality: "Hitec City", price: 8499, img: "https://img.cofynd.com/images/latest_images_2024/81b9bd42bd5c9889d902e03b87477984c2560a57.webp" },
  { name: "The Headquarters Pride", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/original/cb3c39bee6b6ede20e213ad26fe3e9186e9541a9.jpg" },
  { name: "IndiQube Inorbit", locality: "Hitec City", price: 10499, img: "https://img.cofynd.com/images/latest_images_2024/b0f13a024bdf68e5366d7811400560f0a10e094e.webp" },
  { name: "Redbrick Offices Salarpuria", locality: "Hitec City", price: 14999, img: "https://img.cofynd.com/images/latest_images_2024/69a0b0e5adff7d35e96d0af5a08db14b56957d21.webp" },
  { name: "iSprout Divyasree Trinity", locality: "Hitec City", price: 10499, img: "https://img.cofynd.com/images/latest_images_2024/30a53c69e9db9be4c835e1e83f8c729b91b605d0.webp" },
  { name: "Autonetic Space", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/original/71e5d0e125f62a71ac19dc9bf80287fefb833a2b.jpg" },
  { name: "Spacion Business Centre", locality: "Hitec City", price: 7999, img: "https://img.cofynd.com/images/latest_images_2024/599817e20966c5df2b83ed6967447de9d32c734f.webp" },
  { name: "CLOwork Newmark House", locality: "Hitec City", price: 6499, img: "https://img.cofynd.com/images/latest_images_2024/061cefff2aa4c1a3f563931828dc377f6dac6ee7.webp" },
  { name: "Cowork Zone", locality: "Hitec City", price: 5999, img: "https://img.cofynd.com/images/latest_images_2024/4138ce3d4f7645d9bf8452b30fbc32148c3b2795.webp" },
  { name: "TEC Salarpuria Knowledge City", locality: "Hitec City", price: 9999, img: "https://img.cofynd.com/images/latest_images_2024/2be10179738f9a815546a11bd90a9d4a4a05d748.webp" },
  { name: "DevX Hitec City", locality: "Hitec City", price: 8999, img: "https://img.cofynd.com/images/latest_images_2024/c58c6546c042f280d4ad45e9a50548387958b328.webp" },
  { name: "Rent A Desk Hitec City", locality: "Hitec City", price: 8499, img: "https://img.cofynd.com/images/original/09480a6ac92d3becbd9135d7cfdde5702a166887.jpg" },
  { name: "YashShree Space Studio", locality: "Hitec City", price: 8499, img: "https://img.cofynd.com/images/original/64052f3340d60e69685e9aa2435cf3e04c4f9acd.jpg" },
  { name: "UrbanWrk Private Limited", locality: "Hitec City", price: 10499, img: "https://img.cofynd.com/images/original/90cf5a726c889addc524ccff977aa72b5cb98300.jpg" },
  { name: "TEC Salarpuria Knowledge City Level 7 8", locality: "Hitec City", price: 59999, img: "https://img.cofynd.com/images/latest_images_2024/17a68f7c540e6c2cbbd571c0180e75714307969a.webp" },
  { name: "Hive Space 2.0", locality: "Hitec City", price: 7499, img: "https://img.cofynd.com/images/latest_images_2024/2f34971aae6c0fcb240dad0d884a18893c434d92.webp" },
  { name: "Hive Space Business Centre", locality: "Hitec City", price: 8999, img: "https://img.cofynd.com/images/latest_images_2024/0497749355ea07c0cbd8be1bc2c109b5b0707dfa.webp" },
  { name: "CoworkerZone", locality: "Hitec City", price: 8999, img: "https://img.cofynd.com/images/latest_images_2024/6edebff774d607dd065907410b69a3e82ad9c672.webp" },
  // Gachibowli
  { name: "Fun@Work Hyderabad", locality: "Gachibowli", price: 7500, img: "https://img.cofynd.com/images/latest_images_2024/e9de8d64060cca7dfcb3013b01bb406932a25ace.webp" },
  { name: "Awfis Rajapushpa Summit", locality: "Gachibowli", price: 10999, img: "https://img.cofynd.com/images/latest_images_2024/1e0c002405089d0c8185c9622345624dd5b662ae.webp" },
  { name: "Regus SLN Terminus", locality: "Gachibowli", price: 8999, img: "https://img.cofynd.com/images/latest_images_2024/b7a556001a9b9fd46704936daf8ebe92172a4a61.webp" },
  { name: "iKeva Vaishnavi's Cynosure", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/latest_images_2024/a240f10ba5d40089afd6f160c1d9e7e82085d085.webp" },
  { name: "iSprout Sreshtha Marvel", locality: "Gachibowli", price: 8499, img: "https://img.cofynd.com/images/latest_images_2024/95793c298a56ffb9ce3f8381b9010ba45840b191.webp" },
  { name: "Indiqube Pearl", locality: "Gachibowli", price: 6499, img: "https://img.cofynd.com/images/latest_images_2024/0b7198b1d290c53e7be3e7fcf27d3200331d183a.webp" },
  { name: "iSprout Ramky Selenium", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/latest_images_2024/83e8e8da47c2e4ee04486c1e89e99004aa665cf4.webp" },
  { name: "iKeva Rajapushpa Summit", locality: "Gachibowli", price: 11999, img: "https://img.cofynd.com/images/latest_images_2024/d038b46b6c3b80ad1dd9a3dd2276b084224a719d.webp" },
  { name: "iSprout Sohini Tech Park", locality: "Gachibowli", price: 9499, img: "https://img.cofynd.com/images/latest_images_2024/5829740a351f3d124edd93b37223f470d85826a9.webp" },
  { name: "WellWork MPM Corporate House", locality: "Gachibowli", price: 11999, img: "https://img.cofynd.com/images/latest_images_2024/a3e0b22b22619f730bd7de51f10958a1ddf411f2.webp" },
  { name: "Euro Space", locality: "Gachibowli", price: 6499, img: "https://img.cofynd.com/images/latest_images_2024/c90340a60efd7ab47549feceb8361fae32a3737b.webp" },
  { name: "Unispace Gachibowli", locality: "Gachibowli", price: 5999, img: "https://img.cofynd.com/images/original/e9944eb0ba9c732d6da9c642690e7a6fef21f050.jpg" },
  { name: "The Hive", locality: "Gachibowli", price: 9999, img: "https://img.cofynd.com/images/original/69aaa27d36c561bc60b41040ac9ef00d098419e3.jpg" },
  { name: "Inkube", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/original/4da7d86553a54a06741387904f5e79ac4a53af80.jpg" },
  { name: "One Day Coworking Labs", locality: "Gachibowli", price: 3999, img: "https://img.cofynd.com/images/latest_images_2024/272aeff73bf5836277d3b76f57f9f3508d015bd7.webp" },
  { name: "P & S Kickstart", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/original/c2d2839500d063035ab61b50e986cda5cc58edd2.jpg" },
  { name: "Lorven Smart Spaces", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/latest_images_2024/b3dc810076946c666b5766df4bf2f7bca03c45cc.webp" },
  { name: "Work Wild", locality: "Gachibowli", price: 9999, img: "https://img.cofynd.com/images/latest_images_2024/977d2ba49428518070391659b515cfc2b164ebb9.webp" },
  { name: "Quickstart Co-Working Space", locality: "Gachibowli", price: 8899, img: "https://img.cofynd.com/images/latest_images_2024/09b4f8dfe681630c83f902fc1ab9aa6a13af3462.webp" },
  { name: "Partime Co-Work", locality: "Gachibowli", price: 7499, img: "https://img.cofynd.com/images/latest_images_2024/7c931de3feba045bc862c3c589ad4484b568bec7.webp" },
  // Madhapur
  { name: "Regus Madhapur", locality: "Madhapur", price: 59999, img: "https://img.cofynd.com/images/latest_images_2024/c81263b107152ba4dbaad7c8cf35a2ca51ccdcb1.webp" },
  { name: "Offix", locality: "Madhapur", price: 18999, img: "https://img.cofynd.com/images/latest_images_2024/31e04d0df17e2a2a38a6a09209b790f59112e651.webp" },
  { name: "iKeva Lotus Heights", locality: "Madhapur", price: 5999, img: "https://img.cofynd.com/images/latest_images_2024/2e3f46097225315042c3be55990b688b05cdd667.webp" },
  { name: "Cowrks The Skyview 10", locality: "Hitec City", price: 19999, img: "https://img.cofynd.com/images/latest_images_2024/1939b8a0c5d58825438a021a6f08b0a941832cc2.webp" },
  { name: "Redbricks", locality: "Madhapur", price: 11999, img: "https://img.cofynd.com/images/original/bd46910b4aecfc9525669e7a5cec998cbd283053.jpg" },
  { name: "Unispace Madhapur", locality: "Madhapur", price: 5999, img: "https://img.cofynd.com/images/original/8130c249b6edaba458f8faff33abf654b22c9b56.jpg" },
];

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

async function rehostImage(slug, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(url);
  const path = `${slug}.${ext}`;
  const contentType = res.headers.get("content-type") || `image/${ext === "jpg" ? "jpeg" : ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType, upsert: true });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

async function main() {
  const { data: hyd, error: cityErr } = await supabase.from("cities").select("id,name").eq("name", "Hyderabad").single();
  if (cityErr || !hyd) throw new Error(`Could not resolve Hyderabad city: ${cityErr?.message}`);

  const sortedPrices = [...RAW_SPACES.map((r) => r.price)].sort((a, b) => a - b);
  const cityMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];

  let inserted = 0;
  let skipped = 0;
  for (const raw of RAW_SPACES) {
    const slug = slugify(`${raw.name}-${raw.locality}-hyderabad`);
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
      cityName: "Hyderabad",
      amenities,
      vibeTags: vibe_tags,
      priceFrom: raw.price,
      currency: "INR",
      cityMedian,
    }, slug);

    const { error: insErr } = await supabase.from("spaces").insert({
      slug,
      name: raw.name,
      city_id: hyd.id,
      address: `${raw.locality}, Hyderabad`,
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
