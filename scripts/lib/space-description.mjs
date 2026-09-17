// Shared space-description generator. Replaces the old per-script
// small-template-pool approach (6 openers x 5 tails = 30 possible
// descriptions per city, reused verbatim across dozens of listings), which
// Google flagged as duplicate/thin content on 240 of 290 published spaces.
//
// Differentiates each description with real, per-listing facts (specific
// amenities, actual price vs. the city median when known, vibe tag) through
// varied sentence structures, instead of recombining fixed sentences.

function pick(list, seedStr, salt) {
  let h = 0;
  const s = seedStr + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

function amenityPhrase(amenities) {
  if (!amenities || amenities.length === 0) return null;
  const list = amenities.slice(0, 3).map((a) => a.toLowerCase());
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list[0]}, ${list[1]}, and ${list[2]}`;
}

function priceContext(priceFrom, cityMedian) {
  if (!priceFrom || !cityMedian) return null;
  const diffPct = Math.round(((priceFrom - cityMedian) / cityMedian) * 100);
  if (diffPct <= -15) return "priced well under the city median";
  if (diffPct >= 15) return "priced above the city median";
  return "priced close to the city median";
}

// seedKey should be something stable and unique per listing (e.g. the slug)
// so repeated runs produce the same description rather than reshuffling it.
export function buildSpaceDescription({ name, area, cityName, amenities, vibeTags, priceFrom, currency = "INR", cityMedian }, seedKey) {
  const amPhrase = amenityPhrase(amenities);
  const priceNote = priceContext(priceFrom, cityMedian);
  const vibe = vibeTags && vibeTags.length ? vibeTags[0] : null;

  const openers = [
    `${name} sits in ${area}, ${cityName}`,
    `In ${area}, ${cityName}, ${name} operates`,
    `${name} is a coworking space in ${area}, ${cityName}`,
    `Based in ${area}, ${cityName}, ${name} runs a coworking space`,
  ];
  const opener = pick(openers, seedKey, "opener");

  const facts = [];
  if (amPhrase) facts.push(pick([
    `The listing includes ${amPhrase}.`,
    `On offer: ${amPhrase}.`,
    `Members get ${amPhrase}.`,
  ], seedKey, "facts"));
  if (priceFrom) facts.push(pick([
    `Hot desks start at ${currency === "INR" ? "₹" : currency + " "}${priceFrom.toLocaleString("en-IN")}/mo${priceNote ? `, ${priceNote} for ${cityName}` : ""}.`,
    `Plans start from ${currency === "INR" ? "₹" : currency + " "}${priceFrom.toLocaleString("en-IN")} a month${priceNote ? `, ${priceNote}` : ""}.`,
  ], seedKey, "price"));
  if (vibe) facts.push(pick([
    `It leans toward a ${vibe} setup.`,
    `The overall feel here is ${vibe}.`,
  ], seedKey, "vibe"));

  const closers = [
    `Worth a look if you're comparing options in ${cityName}.`,
    `A reasonable pick for teams narrowing down ${cityName} spaces.`,
    `Check current pricing and photos before you shortlist it.`,
  ];
  const closer = pick(closers, seedKey, "closer");

  return [`${opener}.`, ...facts, closer].join(" ");
}
