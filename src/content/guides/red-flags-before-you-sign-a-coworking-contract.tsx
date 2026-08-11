import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Coworking contracts read shorter than a traditional office lease, which makes it easy to
        skim past the clauses that actually decide how expensive or painful an exit gets. A
        fifteen-minute read now saves a much longer argument in month six.
      </WhyThisMatters>

      <Step n={1} title="Find the actual notice period, not the marketing one">
        <p>
          "Flexible, cancel anytime" often means cancel anytime with sixty or ninety days' notice.
          Check the exact number of days and whether notice has to be in writing, by email, or
          through a specific portal, missing the format can reset the clock.
        </p>
      </Step>

      <Step n={2} title="Read the fine print on the seat count">
        <p>
          Some contracts lock you into a minimum seat count regardless of how many people you
          actually bring in. If your team shrinks, you may still owe for desks nobody is sitting
          at until the contract term ends.
        </p>
      </Step>

      <Step n={3} title="Check what happens to the deposit, exactly">
        <p>
          Look for the deduction list, damages, unpaid dues, early termination fees, and how many
          days after move-out the refund actually arrives. "Refundable" alone tells you nothing
          about timing.
        </p>
        <Tip>Ask for the deposit refund timeline in writing over email, not just verbally during the tour.</Tip>
      </Step>

      <Step n={4} title="Confirm what's actually included at the quoted price">
        <p>
          Meeting room credits, printing quotas, and parking are the usual places prices quietly
          expand. Ask for the per-unit overage rate for each before you sign, not after your team
          blows through the monthly allowance.
        </p>
      </Step>

      <Step n={5} title="Look for a unilateral price-increase clause">
        <p>
          Some contracts allow the operator to raise rates on renewal without a cap. If there is
          no ceiling mentioned, ask directly what increase to expect, a vague "market rate" answer
          is itself a signal worth noting.
        </p>
      </Step>

      <Step n={6} title="Get the day-to-day promises in writing">
        <p>
          Dedicated desk, 24/7 access, a specific number of meeting room hours, anything promised
          verbally during the tour that isn't in the contract is not enforceable. Ask for it to be
          added as an annexure if it matters to your decision.
        </p>
      </Step>

      <Closing>
        None of this is about distrust, most operators are straightforward. It's about not
        finding out the hard way, mid-lease, which parts of the pitch were binding and which were
        just sales talk.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "how-to-choose-a-coworking-space" }}>
          How to choose a coworking space
        </RelatedLink>
        <RelatedLink to="/spaces">Compare real prices across spaces</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "red-flags-before-you-sign-a-coworking-contract",
  title: "Red flags before you sign",
  dek: "Contract terms and warning signs worth catching before you commit, not after.",
  category: "coworkers",
  readMins: 5,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
