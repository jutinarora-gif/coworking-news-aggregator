import { getCoworkingArticles } from "@/lib/queries";
import { NewsFeed } from "@/components/site/NewsFeed";

export const revalidate = 1800;

export default async function CoworkingPage() {
  const articles = await getCoworkingArticles(50);

  return (
    <main className="flex-1">
      <NewsFeed
        articles={articles}
        kicker="Industry Dispatch"
        heading={
          <>
            The business <br />
            of working anywhere.
          </>
        }
        description="Coworking industry news — space openings, community trends, and the market shaping where remote workers sit down."
        showFilters={false}
      />
    </main>
  );
}
