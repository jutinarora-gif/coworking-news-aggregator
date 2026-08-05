import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        A space with zero reviews reads as a risk to anyone comparing options. The first five to
        ten reviews matter more than the next fifty, they are what convinces someone to book a
        tour at all.
      </WhyThisMatters>

      <Step n={1} title="Time your ask right">
        <p>
          Do not ask in week one, nobody has an opinion yet. The sweet spot is two to three weeks
          in, once a member has actually used the wifi, sat through a meeting, and dealt with the
          front desk at least once.
        </p>
      </Step>

      <Step n={2} title="Make it a two minute task">
        <p>
          Send the direct link to your space's review page, not a generic "check us out" message.
          The fewer clicks between the ask and the review box, the higher your completion rate.
        </p>
      </Step>

      <Step n={3} title="Ask happy members personally, not a mass blast">
        <p>
          A one-line personal message from the community manager gets a far higher response rate
          than an email blast to your whole member list. Ask the members you already know are
          satisfied first, based on how they use the space day to day.
        </p>
        <Tip>Keep a simple running list of members worth asking, updated whenever someone compliments the space out loud or in your community chat.</Tip>
      </Step>

      <Step n={4} title="Respond to every review, good or bad">
        <p>
          A thoughtful reply to a review, especially a critical one, does more for your
          credibility with future prospects than the review itself. It shows someone is actually
          reading and acting on feedback.
        </p>
      </Step>

      <Step n={5} title="Do not incentivize reviews">
        <p>
          Offering a discount or a free day pass in exchange for a review looks manipulative to
          anyone who reads several reviews in a row, and platforms increasingly filter or flag
          incentivized reviews anyway. Ask for honesty, not a favourable rating.
        </p>
      </Step>

      <Step n={6} title="Track who you asked">
        <p>
          A simple sheet with member name, date asked, and whether they followed through avoids
          asking the same person three times and missing others entirely.
        </p>
      </Step>

      <Closing>
        Ten honest reviews collected over two months beats fifty generic ones collected in a
        panic before a big listing push. Consistency compounds here.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/spaces">See how spaces are reviewed on the directory</RelatedLink>
        <RelatedLink to="/questions">Read what coworkers actually ask</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "getting-your-first-reviews",
  title: "Getting your first reviews",
  dek: "A founder's guide to building trust early on, before you have a long review history to lean on.",
  category: "operators",
  readMins: 4,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
