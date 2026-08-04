import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Replaces the old boilerplate description ("...listed with real-time
// pricing and availability on Cofynd.") that gave away the data source on
// every pre-existing space page. Same organic keyword-rotation approach
// used for the Noida import batch.
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

function parseAddress(address, fallbackCity) {
  if (!address) return { locality: fallbackCity ?? "the area", city: fallbackCity ?? "" };
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) return { locality: parts[0], city: parts[parts.length - 1] };
  return { locality: address, city: fallbackCity ?? "" };
}

async function main() {
  const { data: spaces, error } = await supabase
    .from("spaces")
    .select("id,name,slug,address,city_id,description")
    .not("description", "is", null);
  if (error) throw error;

  const targets = spaces.filter((s) => s.description.toLowerCase().includes("cofynd"));
  console.log(`Found ${targets.length} spaces with the self-outing "Cofynd" description.`);

  const { data: cities } = await supabase.from("cities").select("id,name");
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));

  const usedDescs = new Set();
  let fixed = 0;
  for (const s of targets) {
    const fallbackCity = cityMap.get(s.city_id) ?? undefined;
    const { locality, city } = parseAddress(s.address, fallbackCity);
    const description = buildDescription(s.name, locality, city || "the area", usedDescs);
    const { error: updErr } = await supabase.from("spaces").update({ description }).eq("id", s.id);
    if (updErr) {
      console.error(`Failed to update ${s.slug}:`, updErr.message);
      continue;
    }
    fixed++;
  }
  console.log(`Done. Fixed ${fixed}/${targets.length} descriptions.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
