import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Underpricing leaves money on the table for years, since most members never see a fresh
        quote after they sign. Overpricing without justification just loses the tour. Getting the
        number right the first time matters more than it feels like it should.
      </WhyThisMatters>

      <Step n={1} title="Start from real comparable prices, not gut feel">
        <p>
          Pull actual starting prices for hot desks and dedicated desks from spaces in your
          locality and price bracket, not a citywide average that includes far cheaper or far
          pricier neighborhoods.
        </p>
        <Tip>The India Leaderboard breaks pricing down by city and locality if you want a starting comparison.</Tip>
      </Step>

      <Step n={2} title="Price the amenities that actually cost you money">
        <p>
          Meeting room hours, printing, and parking all have a real per-unit cost. Decide upfront
          how much is bundled into the base price versus billed separately, and be explicit about
          it in the contract, not vague.
        </p>
      </Step>

      <Step n={3} title="Don't compete purely on being the cheapest">
        <p>
          The cheapest desk in a locality attracts the most price-sensitive members, who are also
          statistically the most likely to churn at the next renewal. A slightly higher price with
          a clearer value story usually retains better.
        </p>
      </Step>

      <Step n={4} title="Build in a small amount of negotiation room, then stop negotiating past it">
        <p>
          Most enterprise deals expect some flexibility. Decide your actual floor price before the
          conversation starts, not during it, so you're not making concessions under pressure that
          you'll regret at renewal.
        </p>
      </Step>

      <Step n={5} title="Revisit pricing twice a year, not once every three years">
        <p>
          Rent, utilities, and local competition all shift faster than most operators reprice for.
          A small, predictable annual increase communicated early is far less painful for members
          than a sudden large jump.
        </p>
      </Step>

      <Step n={6} title="Segment pricing by what teams actually value, not just seat count">
        <p>
          A five-person team leasing meeting-room-heavy plans values something different from a
          solo freelancer on a hot desk. Tiered plans built around real usage patterns convert
          better than one flat price for everyone.
        </p>
      </Step>

      <Closing>
        Pricing is not a one-time decision made at launch. Treat it as a number you revisit with
        real market data, the same data your prospective members are already comparing you
        against.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/">See the India Leaderboard</RelatedLink>
        <RelatedLink to="/guides/$slug" params={{ slug: "marketing-your-space-without-paid-ads" }}>
          Marketing without paid ads
        </RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "pricing-your-coworking-space",
  title: "Pricing your space competitively",
  dek: "Using real market data instead of guesswork to land on a number that actually holds.",
  category: "operators",
  readMins: 7,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
