export type Location = {
  id: string;
  country: string;
  country_code: string;
  city: string | null;
  slug: string;
};

export type FeedSource = {
  id: string;
  name: string;
  url: string;
  category: "local" | "coworking_industry";
  location_id: string | null;
};

export type Article = {
  id: string;
  feed_source_id: string | null;
  location_id: string | null;
  title: string;
  link: string;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
  fetched_at: string;
};
