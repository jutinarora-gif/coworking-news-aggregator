-- Seed: popular remote-work/nomad destinations + coworking industry feeds
-- Run after schema.sql

insert into locations (country, country_code, city, slug) values
  ('Portugal', 'PT', null, 'portugal'),
  ('Thailand', 'TH', null, 'thailand'),
  ('Mexico', 'MX', null, 'mexico'),
  ('Indonesia', 'ID', 'Bali', 'indonesia-bali'),
  ('Spain', 'ES', null, 'spain'),
  ('Vietnam', 'VN', null, 'vietnam'),
  ('Colombia', 'CO', null, 'colombia'),
  ('Georgia', 'GE', null, 'georgia'),
  ('Croatia', 'HR', null, 'croatia'),
  ('Japan', 'JP', null, 'japan'),
  ('Brazil', 'BR', null, 'brazil'),
  ('Argentina', 'AR', null, 'argentina'),
  ('Turkey', 'TR', null, 'turkey'),
  ('United Arab Emirates', 'AE', 'Dubai', 'uae-dubai'),
  ('India', 'IN', 'Bangalore', 'india-bangalore'),
  ('India', 'IN', 'Goa', 'india-goa'),
  ('India', 'IN', 'Delhi', 'india-delhi'),
  ('India', 'IN', 'Mumbai', 'india-mumbai')
on conflict (slug) do nothing;

-- Local coworking/remote-work news feeds: Google News RSS search scoped to
-- "coworking" (or "digital nomad") mentions in that destination, NOT general
-- local news. This site aggregates coworking news, not general news by country.
insert into feed_sources (name, url, category, location_id)
select
  l.country || ' coworking news',
  'https://news.google.com/rss/search?q=%22coworking%22+' || replace(coalesce(l.city, l.country), ' ', '+') || '&hl=en-US&gl=US&ceid=US:en',
  'local',
  l.id
from locations l
on conflict (url) do nothing;

-- Coworking industry news (global, no location)
-- Note: Allwork.Space is deliberately excluded — its feed sits behind bot
-- protection (Cloudflare) that blocks the ingest job with a 403.
insert into feed_sources (name, url, category, location_id) values
  ('Coworking Insights', 'https://coworkinginsights.com/feed/', 'coworking_industry', null),
  ('Google News: coworking spaces', 'https://news.google.com/rss/search?q=coworking+space&hl=en-US&gl=US&ceid=US:en', 'coworking_industry', null),
  ('Google News: remote work trends', 'https://news.google.com/rss/search?q=remote+work+trends&hl=en-US&gl=US&ceid=US:en', 'coworking_industry', null)
on conflict (url) do nothing;
