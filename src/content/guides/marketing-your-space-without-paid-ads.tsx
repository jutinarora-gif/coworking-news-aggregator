import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Coworking is a local, trust-driven purchase, most people tour a space before they sign
        anything. That means organic visibility and word of mouth often outperform paid ads for a
        fraction of the cost.
      </WhyThisMatters>

      <Step n={1} title="Claim and complete every free listing that exists">
        <p>
          Google Business Profile, coworking directories, and local business listings all drive
          real search traffic for free. An incomplete listing with no photos or outdated pricing
          loses tours before a prospect even reaches your website.
        </p>
      </Step>

      <Step n={2} title="Turn your best members into referral sources">
        <p>
          A simple referral perk, one free day pass for the referrer and the new member, costs
          almost nothing and converts far better than any ad, because it comes with built-in
          trust.
        </p>
        <Tip>Ask satisfied members directly if they know a team outgrowing a home office, don't wait for them to think of it themselves.</Tip>
      </Step>

      <Step n={3} title="Host events that bring outsiders into the space">
        <p>
          A meetup, panel, or workshop open to non-members fills your space with prospects who get
          to experience it firsthand, which converts better than any photo or video ever will.
        </p>
      </Step>

      <Step n={4} title="Write about what you actually know">
        <p>
          Local founders looking for office space search for practical things, GST registration,
          cost comparisons, neighborhood guides. Content answering those specific questions
          compounds in search traffic long after you publish it.
        </p>
      </Step>

      <Step n={5} title="Make your reviews easy to find and easy to add to">
        <p>
          Reviews are free marketing that keeps working after you've written it. A space with a
          steady stream of recent, honest reviews outperforms a space with a dozen from a single
          launch-week push.
        </p>
      </Step>

      <Step n={6} title="Partner with adjacent local businesses">
        <p>
          Cafes, gyms, and creches near your space share the exact audience you want. A simple
          cross-referral arrangement, no money changing hands, extends your reach without extending
          your budget.
        </p>
      </Step>

      <Closing>
        None of this replaces a good product. But a good space with no visibility loses to a
        mediocre space that shows up everywhere a prospect looks. Organic marketing is slower, but
        it compounds in a way paid ads don't.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "getting-your-first-reviews" }}>
          Getting your first reviews
        </RelatedLink>
        <RelatedLink to="/guides/$slug" params={{ slug: "pricing-your-coworking-space" }}>
          Pricing your space competitively
        </RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "marketing-your-space-without-paid-ads",
  title: "Marketing without paid ads",
  dek: "Organic ways to fill desks that compound over time instead of stopping when the budget does.",
  category: "operators",
  readMins: 6,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
