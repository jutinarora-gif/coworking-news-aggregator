import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Most negative reviews aren't about the big things operators worry about, they're about a
        handful of small, recurring frustrations. Fixing those first usually moves your rating
        more than any new amenity would.
      </WhyThisMatters>

      <Step n={1} title="Wifi that drops during calls">
        <p>
          This is the single most common complaint across coworking reviews. It doesn't need to be
          the fastest connection in the city, it needs to never drop mid-call. A backup connection
          that fails over automatically fixes most of this.
        </p>
      </Step>

      <Step n={2} title="Meeting rooms that are double-booked or unusable">
        <p>
          A broken screen, a room that's booked but empty, or a booking system that doesn't sync
          in real time all show up in reviews far more than members mention out loud. Audit your
          booking flow from a member's perspective every quarter.
        </p>
      </Step>

      <Step n={3} title="Billing surprises">
        <p>
          Unclear overage charges, a deposit that takes weeks to return, or a price increase with
          no notice are consistently among the harshest reviews, because they read as a trust
          issue, not just an inconvenience.
        </p>
        <Tip>A short email before any charge outside the base plan prevents most billing complaints entirely.</Tip>
      </Step>

      <Step n={4} title="Noise at desks marked as quiet zones">
        <p>
          If a zone is labeled quiet, members expect it enforced. A single loud phone call left
          unaddressed in a quiet zone does more damage to trust than the noise itself, because it
          signals the label doesn't mean anything.
        </p>
      </Step>

      <Step n={5} title="AC and temperature complaints">
        <p>
          It comes up constantly, and it's rarely about the AC itself, it's about nobody
          responding when it's reported. A visible, fast response to a temperature complaint
          matters more than getting it perfect on the first try.
        </p>
      </Step>

      <Step n={6} title="Front desk and community manager turnover">
        <p>
          Members build relationships with the person at the front desk. Frequent staff turnover
          without any handoff reads as instability, even when the space itself hasn't changed at
          all.
        </p>
      </Step>

      <Closing>
        None of these require a big budget to fix. They require someone checking in on them
        regularly, which is usually the actual gap, not a lack of resources.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "handling-a-bad-review-the-right-way" }}>
          Handling a bad review the right way
        </RelatedLink>
        <RelatedLink to="/guides/$slug" params={{ slug: "community-management-101" }}>
          Community management 101
        </RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "what-members-actually-complain-about",
  title: "What members actually complain about",
  dek: "The most common red flags coworkers report, and how to fix the ones that matter most.",
  category: "operators",
  readMins: 6,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
