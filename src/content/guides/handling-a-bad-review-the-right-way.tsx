import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Prospects reading reviews pay as much attention to how an operator responds as to the
        complaint itself. A defensive or absent response does more damage than the original review
        ever could.
      </WhyThisMatters>

      <Step n={1} title="Wait a few hours before replying">
        <p>
          Responding within minutes, especially to a harsh review, often reads as reactive rather
          than considered. A short pause to actually check what happened produces a better, calmer
          reply.
        </p>
      </Step>

      <Step n={2} title="Acknowledge the specific issue, not a generic apology">
        <p>
          "Sorry you had a bad experience" reads as dismissive. Naming the actual problem, the AC,
          a billing delay, a noisy neighbor, shows you actually read the review instead of pasting
          a template.
        </p>
        <Tip>Reference the specific detail from the review in your first sentence, it's the fastest way to signal you actually read it.</Tip>
      </Step>

      <Step n={3} title="Take the resolution offline">
        <p>
          A public reply saying "we'd like to make this right, please reach out to [contact]"
          shows good faith to future readers without turning the review thread into a back and
          forth argument.
        </p>
      </Step>

      <Step n={4} title="Never argue with a reviewer publicly">
        <p>
          Even a factually accurate correction reads badly in public. If the review contains a
          genuine factual error, a calm, brief clarification works, a defensive rebuttal does not,
          regardless of who's actually right.
        </p>
      </Step>

      <Step n={5} title="Fix the underlying issue, then say so">
        <p>
          If several reviews point at the same problem, fixing it and mentioning the fix, in a new
          reply or a follow-up post, turns a recurring complaint into a visible sign that feedback
          gets acted on.
        </p>
      </Step>

      <Step n={6} title="Don't chase a review removal unless it violates actual policy">
        <p>
          Reporting reviews for being negative rather than fake or abusive usually backfires if
          the reviewer notices and posts about it. Save review flagging for genuine policy
          violations, not just reviews you disagree with.
        </p>
      </Step>

      <Closing>
        A single well-handled bad review, visible to everyone who reads it afterward, can do more
        for your credibility than ten quiet five-star ones. It's one of the only places a mistake
        actually works in your favor.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "what-members-actually-complain-about" }}>
          What members actually complain about
        </RelatedLink>
        <RelatedLink to="/guides/$slug" params={{ slug: "getting-your-first-reviews" }}>
          Getting your first reviews
        </RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "handling-a-bad-review-the-right-way",
  title: "Handling a bad review the right way",
  dek: "Responding without making it worse, and turning a public complaint into a credibility signal.",
  category: "operators",
  readMins: 5,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
