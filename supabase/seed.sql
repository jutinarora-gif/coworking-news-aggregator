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
  ('United Arab Emirates', 'AE', 'Dubai', 'uae-dubai')
on conflict (slug) do nothing;

-- Local news feeds: Google News RSS search per country
insert into feed_sources (name, url, category, location_id)
select
  l.country || ' local news',
  'https://news.google.com/rss/search?q=' || replace(coalesce(l.city, l.country), ' ', '+') || '&hl=en-US&gl=US&ceid=US:en',
  'local',
  l.id
from locations l
on conflict (url) do nothing;

-- Coworking industry news (global, no location)
insert into feed_sources (name, url, category, location_id) values
  ('Allwork.Space', 'https://allwork.space/feed/', 'coworking_industry', null),
  ('Coworking Insights', 'https://coworkinginsights.com/feed/', 'coworking_industry', null),
  ('Google News: coworking spaces', 'https://news.google.com/rss/search?q=coworking+space&hl=en-US&gl=US&ceid=US:en', 'coworking_industry', null),
  ('Google News: remote work trends', 'https://news.google.com/rss/search?q=remote+work+trends&hl=en-US&gl=US&ceid=US:en', 'coworking_industry', null)
on conflict (url) do nothing;
