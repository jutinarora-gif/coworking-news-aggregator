import { Link } from "@tanstack/react-router";
import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        A wrong pick costs more than the deposit. It costs the hours spent fixing a bad decision
        three months in, when you are stuck in a contract and the wifi still drops mid-call.
      </WhyThisMatters>

      <Step n={1} title="Know your work pattern before you shortlist anything">
        <p>
          Write down how many days a week your team actually shows up, and whether the work is
          mostly calls or heads-down focus. A hot desk works fine for two or three days a week. A
          dedicated desk or cabin is cheaper per day once your team is in five days a week. Once
          you know this, start your shortlist on{" "}
          <Link to="/spaces" className="text-iris underline underline-offset-2">
            our spaces directory
          </Link>
          , filtered by your city.
        </p>
      </Step>

      <Step n={2} title="Run the commute test">
        <p>
          Get directions from where your team actually lives, not from your own house. Anything
          that adds more than thirty minutes to most people's commute gets rejected quickly in
          practice, no matter how nice the space looks.
        </p>
      </Step>

      <Step n={3} title="Visit at a busy hour, not the quiet tour slot">
        <p>
          Sales tours tend to happen at quiet hours, usually late morning. Ask to visit at 3pm on
          a weekday and see what the space feels like when it is actually full.
        </p>
        <Tip>Sit at a hot desk for twenty minutes and run a real video call before you decide anything.</Tip>
      </Step>

      <Step n={4} title="Test the wifi and noise yourself">
        <p>
          Do not take the sales rep's word for it. Ask for the wifi password and run a speed test
          on your own phone, at the busy hour from step 3, not during the calm tour. Our{" "}
          <Link to="/" className="text-iris underline underline-offset-2">
            India leaderboard
          </Link>{" "}
          also tracks which spaces consistently score well on wifi, worth a look before you visit.
        </p>
      </Step>

      <Step n={5} title="Read the exit clause before you fall for the amenities">
        <p>
          Free coffee and a nice terrace do not matter if the contract has a steep exit fee or
          auto-renews quietly. Ask specifically about the notice period, deposit refund terms,
          and what happens if you need to downsize your seat count midway.
        </p>
      </Step>

      <Step n={6} title="Check reviews for community and support, not just the desk">
        <p>
          A coworking space is as much about the people running it as the furniture. Ratings on
          community and support tell you more than the lobby photos ever will. If you are choosing
          between a few options, our{" "}
          <Link to="/questions" className="text-iris underline underline-offset-2">
            community Q&amp;A
          </Link>{" "}
          often has someone who has already asked the exact question you are stuck on.
        </p>
      </Step>

      <Closing>
        None of this takes more than an extra day or two, and it is a lot cheaper than breaking a
        lease three months in.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/spaces">Browse coworking spaces with reviews</RelatedLink>
        <RelatedLink to="/winners">See this week's top-rated spaces</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "how-to-choose-a-coworking-space",
  title: "How to choose a coworking space: a practical checklist",
  dek: "Six steps to pick a space that actually fits how your team works, not just how it photographs.",
  category: "coworkers",
  readMins: 4,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
