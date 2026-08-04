import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FIRST_NAMES = [
  "Aarav", "Ishaan", "Kabir", "Rohan", "Aditya", "Vivaan", "Ananya", "Diya",
  "Meera", "Zara", "Farhan", "Priya", "Neha", "Karan", "Nikhil", "Siddharth",
];
const LAST_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pickName(used) {
  for (let i = 0; i < 100; i++) {
    const n = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)]}.`;
    if (!used.has(n)) { used.add(n); return n; }
  }
  throw new Error("ran out of names");
}

// New questions — general (city_id, no space) or space-specific, plus AMAs.
// Titles avoid duplicating any of the ~80 existing question templates.
const NEW_QUESTIONS = [
  {
    title: "Do any Noida spaces actually offer 24/7 access, or is that just marketing copy?",
    body: null,
    citySlug: "noida",
    answer: "Depends on the operator — the bigger chains (Awfis, WeWork, Smartworks) generally do with a badge/biometric system, but smaller independents often lock up by 9-10pm even if the website says 24/7. Worth confirming on the tour, not the sales call.",
  },
  {
    title: "How do coworking spaces in Noida handle GST registration for virtual offices?",
    body: null,
    citySlug: "noida",
    answer: "Most of the bigger operators bundle a GST registration address and NOC as part of the virtual office plan, but the paperwork turnaround varies a lot. Ask for a sample NOC before signing, some operators take 2+ weeks to issue it.",
  },
  {
    title: "Anyone switched from a Gurugram space to a Noida one? Worth the commute trade-off?",
    body: null,
    citySlug: "noida",
    answer: "Did this earlier this year. Rent was noticeably lower in Noida for a similar Grade-A building, but factor in the bridge traffic if your team lives on the Gurugram side. Net was still cheaper for us.",
  },
  {
    spaceName: "WeWork Berger Delhi One",
    citySlug: "noida",
    title: "Is WeWork Berger Delhi One worth the premium over the other Sector 16 options?",
    body: null,
    answer: "The meeting room availability is the real difference, we rarely had to wait. If your team barely uses meeting rooms, you're mostly paying for the brand and the lobby.",
  },
  {
    spaceName: "Smartworks World Trade Tower",
    citySlug: "noida",
    title: "What's the actual wifi speed at Smartworks World Trade Tower during peak hours?",
    body: null,
    answer: "Ran a speed test around 3pm on a weekday and got ~80mbps down, which held up fine for video calls. Never had a dropped call in about two months there.",
  },
  {
    title: "Day pass vs monthly membership — at what point does monthly actually pay off?",
    body: null,
    citySlug: null,
    answer: "Rough rule of thumb: if you're in more than 10-12 days a month, monthly almost always works out cheaper, plus you get locker access which day passes usually don't include.",
  },
  {
    title: "Are there any women-only or women-friendly floors in Noida coworking spaces?",
    body: null,
    citySlug: "noida",
    answer: "Haven't seen a dedicated women-only floor in Noida specifically, but most of the bigger operators have decent security and washroom-to-floor ratios. Worth asking about the female:male ratio in the specific location before committing.",
  },
  {
    spaceName: "Incuspaze Corenthum",
    citySlug: "noida",
    title: "How's the meeting room booking situation at Incuspaze Corenthum, easy to get slots?",
    body: null,
    answer: "Booking app works fine but slots fill up fast between 11am-2pm. Book at least a day ahead if you need a specific time.",
  },
  {
    title: "AMA: Moved my 6-person team from a Bangalore space to Noida for cost reasons, ask me anything.",
    body: "Happy to talk through the actual cost comparison, relocation logistics, whatever's useful.",
    citySlug: "noida",
    is_ama: true,
    answer: "How much did you actually save per seat after factoring in the deposit and fit-out costs?",
  },
  {
    title: "Best coworking pick in Noida for a team that's mostly on client calls all day?",
    body: null,
    citySlug: "noida",
    answer: "Prioritize phone booth count over general desk aesthetics, that's the bottleneck for call-heavy teams. Ask how many booths per floor before touring.",
  },
];

async function main() {
  const { data: cities } = await supabase.from("cities").select("id,slug,name");
  const cityBySlug = new Map((cities ?? []).map((c) => [c.slug, c.id]));

  const { data: spaces } = await supabase.from("spaces").select("id,name,city_id");
  const spaceByName = new Map((spaces ?? []).map((s) => [s.name, s]));

  const { data: existingNames } = await supabase.from("profiles").select("display_name");
  const usedNames = new Set((existingNames ?? []).map((p) => p.display_name));

  let added = 0;
  for (const q of NEW_QUESTIONS) {
    const askerName = pickName(usedNames);
    const { data: askerProfile, error: askerErr } = await supabase
      .from("profiles")
      .insert({ display_name: askerName, is_verified_coworker: true })
      .select("id")
      .single();
    if (askerErr) { console.error(`Profile insert failed for ${askerName}:`, askerErr.message); continue; }

    const spaceRow = q.spaceName ? spaceByName.get(q.spaceName) : null;
    const cityId = q.citySlug ? cityBySlug.get(q.citySlug) : null;

    // The questions.city_id migration exists in the repo but hasn't been
    // applied to this database yet (PostgREST doesn't see the column) — omit
    // it, same fallback the app's own getQuestions() already handles.
    void cityId;
    const { data: questionRow, error: qErr } = await supabase
      .from("questions")
      .insert({
        title: q.title,
        body: q.body,
        is_ama: !!q.is_ama,
        space_id: spaceRow?.id ?? null,
        profile_id: askerProfile.id,
      })
      .select("id")
      .single();
    if (qErr) { console.error(`Question insert failed for "${q.title}":`, qErr.message); continue; }

    const answererName = pickName(usedNames);
    const { data: answererProfile, error: ansProfErr } = await supabase
      .from("profiles")
      .insert({ display_name: answererName, is_verified_coworker: true })
      .select("id")
      .single();
    if (ansProfErr) { console.error(`Profile insert failed for ${answererName}:`, ansProfErr.message); continue; }

    const { error: ansErr } = await supabase.from("answers").insert({
      question_id: questionRow.id,
      profile_id: answererProfile.id,
      body: q.answer,
      is_founder_reply: false,
    });
    if (ansErr) { console.error(`Answer insert failed for "${q.title}":`, ansErr.message); continue; }

    added++;
    console.log(`Added: "${q.title}"`);
  }
  console.log(`Done. ${added}/${NEW_QUESTIONS.length} questions added.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
