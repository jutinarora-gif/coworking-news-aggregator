import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Card thumbnails render at ~350-400px but stored cover_url values are
// often full-size (w=1200 Unsplash fallbacks, or unresized CDN photos),
// costing 150-200KB per image for a thumbnail. Unsplash serves any width
// from the same photo ID on the fly, so rewrite the query params at render
// time instead of re-touching every stored row. Other hosts are left as-is
// since we can't assume they support the same resize API.
export function cardImageUrl(url: string | null | undefined, width = 640): string | null {
  if (!url) return null;
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(width));
    u.searchParams.set("q", "70");
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
}
