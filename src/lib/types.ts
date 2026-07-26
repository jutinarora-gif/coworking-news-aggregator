export type Location = {
  id: string;
  country: string;
  country_code: string;
  city: string | null;
  slug: string;
  image_url: string | null;
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

export type CoworkingSpace = {
  id: string;
  location_id: string | null;
  name: string;
  slug: string;
  address: string | null;
  website: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  currency: string;
  plan_types: string[] | null;
  amenities: string[] | null;
  capacity_seats: number | null;
  source_url: string | null;
  verified_at: string | null;
  notes: string | null;
};
