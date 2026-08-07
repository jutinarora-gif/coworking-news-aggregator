import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/page-heading";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy , The Coworking Dispatch" },
      { name: "description", content: "How The Coworking Dispatch collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeading eyebrow="Legal" title="Privacy policy" sub="Last updated 27 July 2026." />

      <Section title="1. What we collect">
        <p>
          <strong className="text-foreground">Account data:</strong> if you sign in (via email/password or
          Google), we store your email address and, if you use Google sign-in, your name and profile photo as
          provided by Google.
        </p>
        <p>
          <strong className="text-foreground">Content you submit:</strong> reviews, questions, and answers you
          post, along with the display name you choose.
        </p>
        <p>
          <strong className="text-foreground">Usage data:</strong> we use Google Analytics to understand traffic
          patterns (pages viewed, approximate location, device type). This is aggregated and not tied to your
          identity unless you're signed in.
        </p>
      </Section>

      <Section title="2. How we use it">
        <p>
          To operate the site (show your reviews and questions under your display name), to improve it (via
          aggregate analytics), and to respond if you contact us. We don't sell your data to third parties.
        </p>
      </Section>

      <Section title="3. Google sign-in">
        <p>
          If you sign in with Google, authentication is handled by Google and Supabase (our backend provider). We
          only receive the basic profile information Google shares (email, name, photo), never your Google
          password.
        </p>
      </Section>

      <Section title="4. Cookies">
        <p>
          We use essential cookies to keep you signed in, and analytics cookies (Google Analytics) to understand
          site usage. You can block these in your browser settings; the site will still function, though you'll
          need to sign in again each visit.
        </p>
      </Section>

      <Section title="5. Data retention and deletion">
        <p>
          We keep your account and content for as long as your account is active. Want your data deleted? Email{" "}
          <a href="mailto:info@coworkingdispatch.com" className="acid-underline hover:acid-underline-hover font-medium text-foreground">info@coworkingdispatch.com</a>{" "}
          and we'll remove your account, reviews, and questions within a reasonable time.
        </p>
      </Section>

      <Section title="6. Third-party content">
        <p>
          Dispatch articles link out to third-party publishers with their own privacy policies. We're not
          responsible for how those sites handle your data once you click through.
        </p>
      </Section>

      <Section title="7. Changes to this policy">
        <p>We may update this policy periodically. Material changes will be reflected by an updated "last updated" date above.</p>
      </Section>

      <Section title="8. Contact">
        <p>
          Questions about this policy or your data? Email <a href="mailto:info@coworkingdispatch.com" className="acid-underline hover:acid-underline-hover font-medium text-foreground">info@coworkingdispatch.com</a>.
        </p>
      </Section>
    </div>
  );
}
