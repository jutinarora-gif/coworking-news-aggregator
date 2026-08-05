import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Acquiring a new member costs far more than keeping one. Community management is the
        cheapest retention lever a coworking space has, and the one most operators underinvest in
        once the initial launch excitement wears off.
      </WhyThisMatters>

      <Step n={1} title="Learn every regular's name and what they actually do">
        <p>
          Not just a friendly hello, know what they are building. A community manager who can
          say "how did that client pitch go" instead of "how are you" is the single biggest
          differentiator members mention in reviews.
        </p>
      </Step>

      <Step n={2} title="Run one good event a month, not four half-hearted ones">
        <p>
          A single well-planned event with decent turnout beats a packed calendar of poorly
          attended ones. Members notice when an event feels like a checkbox versus something the
          team actually cared about.
        </p>
      </Step>

      <Step n={3} title="Build a feedback loop you actually close">
        <p>
          A WhatsApp group or suggestion box is only useful if members see their feedback acted
          on. Post a short monthly update: here is what you told us, here is what we changed.
        </p>
        <Tip>Even "we heard you but can't fix this yet, here's why" builds more trust than silence.</Tip>
      </Step>

      <Step n={4} title="Fix small visible things fast">
        <p>
          A jammed printer, an empty coffee machine, or a broken chair left unfixed for a week
          erodes trust faster than almost anything else, because it signals nobody is really
          paying attention day to day.
        </p>
      </Step>

      <Step n={5} title="Spotlight members' wins">
        <p>
          A short shoutout when a member closes a funding round, ships a product, or hits a
          milestone costs nothing and makes the space feel like more than a desk rental. It also
          quietly becomes marketing content you did not have to create from scratch.
        </p>
      </Step>

      <Step n={6} title="Notice the quiet signs someone is about to leave">
        <p>
          Reduced attendance, skipped events, or a sudden drop in casual conversation are usually
          early signals. A short, genuine check-in before the renewal conversation often costs
          less than winning the member back after they have already left.
        </p>
      </Step>

      <Closing>
        None of this requires a big budget. It requires someone paying consistent attention,
        which is exactly what most members mean when they rate a space highly on community.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "getting-your-first-reviews" }}>
          Getting your first reviews
        </RelatedLink>
        <RelatedLink to="/">See the India Leaderboard</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "community-management-101",
  title: "Community management 101",
  dek: "Keeping members engaged once they've signed up, on a realistic budget.",
  category: "operators",
  readMins: 4,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
