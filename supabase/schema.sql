-- Coworking & Local News Aggregator schema

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  country_code text not null,
  city text,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists feed_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  category text not null check (category in ('local', 'coworking_industry')),
  location_id uuid references locations(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  feed_source_id uuid references feed_sources(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  title text not null,
  link text not null unique,
  summary text,
  image_url text,
  published_at timestamptz,
  fetched_at timestamptz not null default now()
);

create index if not exists articles_location_idx on articles(location_id);
create index if not exists articles_published_idx on articles(published_at desc);
create index if not exists feed_sources_category_idx on feed_sources(category);

alter table locations enable row level security;
alter table feed_sources enable row level security;
alter table articles enable row level security;

create policy "Public read locations" on locations for select using (true);
create policy "Public read feed_sources" on feed_sources for select using (true);
create policy "Public read articles" on articles for select using (true);
