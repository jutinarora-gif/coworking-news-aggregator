import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/page-heading";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions , The Coworking Dispatch" },
      { name: "description", content: "Terms and conditions for using The Coworking Dispatch." },
    ],
  }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeading eyebrow="Legal" title="Terms and conditions" sub="Last updated 27 July 2026." />

      <Section title="1. Using this site">
        <p>
          The Coworking Dispatch ("we", "us") provides coworking news, space listings, reviews, and community
          Q&A for informational purposes. By using this site you agree to these terms.
        </p>
      </Section>

      <Section title="2. Third-party news content">
        <p>
          Dispatches shown on this site are aggregated from third-party publishers via public RSS feeds. Each
          dispatch links to its original source. We don't claim ownership of that content, and we're not
          responsible for its accuracy, opinions expressed, or availability of the original article.
        </p>
      </Section>

      <Section title="3. Space listings and reviews">
        <p>
          Space names, addresses, and pricing shown on this site are compiled from public coworking directories
          and may not always be current. Always confirm pricing and availability directly with the space before
          signing anything.
        </p>
        <p>
          Reviews reflect the opinions of the individuals who posted them, not The Coworking Dispatch. We don't
          verify every claim made in a review, though we do moderate for abuse, spam, and clearly fabricated
          content.
        </p>
      </Section>

      <Section title="4. Your account and content">
        <p>
          If you create an account to post reviews, questions, or answers, you're responsible for what you post.
          Don't post anything defamatory, false, abusive, or that violates someone else's rights. We can remove
          content or suspend accounts that violate these terms.
        </p>
      </Section>

      <Section title="5. No affiliate relationships">
        <p>
          We don't take payment from coworking operators to rank higher, appear as "Space of the Week", or win a
          weekly award. Our scoring formula is published on the <a href="/winners" className="acid-underline hover:acid-underline-hover font-medium text-foreground">Winners</a> page.
        </p>
      </Section>

      <Section title="6. Limitation of liability">
        <p>
          This site is provided "as is" without warranties of any kind. We're not liable for decisions made based
          on information found here, including choosing (or not choosing) a coworking space.
        </p>
      </Section>

      <Section title="7. Changes">
        <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>
      </Section>

      <Section title="8. Contact">
        <p>
          Questions about these terms? Email <a href="mailto:info@coworkingdispatch.com" className="acid-underline hover:acid-underline-hover font-medium text-foreground">info@coworkingdispatch.com</a>.
        </p>
      </Section>
    </div>
  );
}
