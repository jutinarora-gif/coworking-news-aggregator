const RELEVANT_KEYWORDS = ["coworking", "co-working", "remote work", "remote-work", "digital nomad"];

export function isRelevant(title: string, summary: string | null): boolean {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  return RELEVANT_KEYWORDS.some((keyword) => text.includes(keyword));
}

// Google News (and most syndicators) append " - Source Name" to every title.
// Wire stories get republished across dozens of outlets with the same lede
// but a different trailing source and a different link, so stripping that
// suffix lets us dedup by the actual headline instead of the URL.
export function normalizeTitle(title: string): string {
  return title
    .replace(/\s*[-|]\s*[^-|]+$/, "")
    .trim()
    .toLowerCase();
}
