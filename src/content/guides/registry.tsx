import type { GuideMeta, GuideModule } from "./types";
import howToChooseGuide from "./how-to-choose-a-coworking-space";
import costBreakdownGuide from "./coworking-vs-traditional-office-cost-breakdown";
import gstGuide from "./gst-registration-virtual-offices-guide";
import firstReviewsGuide from "./getting-your-first-reviews";
import communityManagementGuide from "./community-management-101";

// Every planned guide, written or not, so the /guides index can list the
// full lineup consistently. Guides not yet written just render as "Coming
// soon" cards until their entry is added to WRITTEN below.
export const ALL_GUIDES_META: GuideMeta[] = [
  { slug: "how-to-choose-a-coworking-space", title: "How to choose a coworking space", dek: "A practical checklist for picking the right one, not just the closest one.", category: "coworkers", readMins: 4 },
  { slug: "coworking-vs-traditional-office-cost-breakdown", title: "Coworking vs. traditional office", dek: "A real cost breakdown for small teams deciding between the two.", category: "coworkers", readMins: 5 },
  { slug: "gst-registration-virtual-offices-guide", title: "GST registration and virtual offices", dek: "What founders actually need to know before signing up.", category: "coworkers", readMins: 5 },
  { slug: "red-flags-before-you-sign-a-coworking-contract", title: "Red flags before you sign", dek: "Contract terms and warning signs worth catching early.", category: "coworkers", readMins: 5 },
  { slug: "coworking-etiquette-unwritten-rules", title: "Coworking etiquette", dek: "The unwritten rules of sharing a workspace with strangers.", category: "coworkers", readMins: 5 },
  { slug: "getting-your-first-reviews", title: "Getting your first reviews", dek: "A founder's guide to building trust early on.", category: "operators", readMins: 4 },
  { slug: "community-management-101", title: "Community management 101", dek: "Keeping members engaged once they've signed up.", category: "operators", readMins: 4 },
  { slug: "pricing-your-coworking-space", title: "Pricing your space competitively", dek: "Using real market data instead of guesswork.", category: "operators", readMins: 7 },
  { slug: "what-members-actually-complain-about", title: "What members actually complain about", dek: "The most common red flags coworkers report, and how to fix them.", category: "operators", readMins: 6 },
  { slug: "marketing-your-space-without-paid-ads", title: "Marketing without paid ads", dek: "Organic ways to fill desks.", category: "operators", readMins: 6 },
  { slug: "handling-a-bad-review-the-right-way", title: "Handling a bad review the right way", dek: "Responding without making it worse.", category: "operators", readMins: 5 },
];

// Guides that actually have written content. Add each new guide module here
// once it's written.
const WRITTEN: GuideModule[] = [howToChooseGuide, costBreakdownGuide, gstGuide, firstReviewsGuide, communityManagementGuide];

export const WRITTEN_GUIDES: Map<string, GuideModule> = new Map(WRITTEN.map((g) => [g.slug, g]));

export function getGuide(slug: string): GuideModule | undefined {
  return WRITTEN_GUIDES.get(slug);
}
