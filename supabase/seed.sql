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

-- Destination photos (Wikimedia Commons, no API key needed). Rendered
-- grayscale by default on the site, full color on hover.
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg' where slug = 'portugal';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/0020-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%A3%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg/3840px-0020-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%A3%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg' where slug = 'thailand';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sobrevuelos_CDMX_HJ2A4913_%2825514321687%29_%28cropped%29.jpg/3840px-Sobrevuelos_CDMX_HJ2A4913_%2825514321687%29_%28cropped%29.jpg' where slug = 'mexico';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Ubud_%2849818456887%29.jpg/3840px-Ubud_%2849818456887%29.jpg' where slug = 'indonesia-bali';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/3840px-Evening_light_over_Barcelona.jpg' where slug = 'spain';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg' where slug = 'vietnam';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/El_Poblado_Medell%C3%ADn.jpg' where slug = 'colombia';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg/3840px-View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg' where slug = 'georgia';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Split_080620-133710-IMG_0968x.jpg' where slug = 'croatia';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg' where slug = 'japan';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/73/Marginal_Pinheiros_e_Jockey_Club.jpg' where slug = 'brazil';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Puerto_Madero%2C_Buenos_Aires_%2840689219792%29_%28cropped%29.jpg' where slug = 'argentina';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Historical_peninsula_and_modern_skyline_of_Istanbul.jpg' where slug = 'turkey';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/3840px-Burj_Khalifa_2021.jpg' where slug = 'uae-dubai';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg/3840px-View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg' where slug = 'india-bangalore';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Panaji_City.JPG' where slug = 'india-goa';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Forecourt%2C_Rashtrapati_Bhavan_-_1.jpg/3840px-Forecourt%2C_Rashtrapati_Bhavan_-_1.jpg' where slug = 'india-delhi';
update locations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg' where slug = 'india-mumbai';

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
