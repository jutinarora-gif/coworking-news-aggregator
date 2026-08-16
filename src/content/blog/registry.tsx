import type { BlogMeta, BlogModule } from "./types";
import redFlagsPost from "./6-coworking-red-flags-we-see-again-and-again";
import cancelMembershipPost from "./monthly-coworking-membership-can-you-cancel-anytime";
import coworkingVsManagedPost from "./how-should-a-startup-choose-between-coworking-and-a-managed-office";

// Every planned post, written or not, so /blog can list the full lineup
// consistently. Posts not yet written render as "Coming soon" cards until
// their entry is added to WRITTEN below. Order here is newest-first --
// index 0 is the featured lead card on /blog.
export const ALL_POSTS_META: BlogMeta[] = [
  { ...coworkingVsManagedPost },
  { ...cancelMembershipPost },
  { ...redFlagsPost },
  {
    slug: "the-real-cost-of-a-hot-desk-in-bengaluru",
    title: "The real cost of a hot desk in Bengaluru",
    category: "Economics",
    date: "Coming soon",
    read: "8 min",
    excerpt: "Listed price is the opening bid. We added up lock ins, printing, meeting room credits and the coffee upsell across 12 spaces to find what a desk actually costs a founder per month.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "community-is-a-feature-not-a-poster",
    title: "Community is a feature, not a poster",
    category: "Culture",
    date: "Coming soon",
    read: "6 min",
    excerpt: "Every space sells community. Only a handful staff it. Here is how to tell the difference in one walkthrough, before you sign anything.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "wifi-that-survives-a-demo-day",
    title: "Wifi that survives a demo day",
    category: "Field notes",
    date: "Coming soon",
    read: "5 min",
    excerpt: "We ran speed tests at peak hours across Mumbai and Gurugram. The gap between the marketing number and the 4pm number is the whole story.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "why-tier-two-cities-are-winning-the-flex-race",
    title: "Why tier two cities are winning the flex race",
    category: "India desk",
    date: "Coming soon",
    read: "9 min",
    excerpt: "Indore, Kochi and Jaipur are adding desks faster than they are adding traffic. Operators there are building for locals, not for headlines.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "the-quiet-floor-problem",
    title: "The quiet floor problem",
    category: "Design",
    date: "Coming soon",
    read: "4 min",
    excerpt: "Open plans sell tours and ruin afternoons. A short argument for acoustic zoning, and the three spaces that already got it right.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "what-global-operators-keep-getting-wrong-in-india",
    title: "What global operators keep getting wrong in India",
    category: "Global",
    date: "Coming soon",
    read: "7 min",
    excerpt: "Imported playbooks, imported pricing, imported furniture. The 30 percent of the world we cover has plenty to learn from the 70 percent.",
    metaDescription: "",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
  },
];

// Posts that actually have written content. Add each new post module here
// once it's written.
const WRITTEN: BlogModule[] = [coworkingVsManagedPost, cancelMembershipPost, redFlagsPost];

export const WRITTEN_POSTS: Map<string, BlogModule> = new Map(WRITTEN.map((p) => [p.slug, p]));

export function getPost(slug: string): BlogModule | undefined {
  return WRITTEN_POSTS.get(slug);
}
