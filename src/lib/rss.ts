import Parser from "rss-parser";

const parser = new Parser();

export type ParsedArticle = {
  title: string;
  link: string;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
};

export async function fetchFeed(url: string): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title as string,
      link: item.link as string,
      summary: item.contentSnippet ?? null,
      image_url: item.enclosure?.url ?? null,
      published_at: item.isoDate ?? item.pubDate ?? null,
    }));
}
