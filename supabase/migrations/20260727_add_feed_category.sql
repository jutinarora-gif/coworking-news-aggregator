-- Distinguish real news outlets from brand/trade blogs so the wire feed
-- can enforce a news-heavy mix instead of drowning in company blog posts.
alter table feeds add column if not exists category text not null default 'blog' check (category in ('news', 'blog'));

update feeds set category = 'news' where source_site in (
  'inc42.com',
  'economictimes.com',
  'yourstory.com',
  'moneycontrol.com',
  'timesofindia.indiatimes.com',
  'hindustantimes.com'
);

update feeds set category = 'blog' where source_site in (
  '91springboard.com',
  'cowrks.com',
  'gcuc.co',
  'workdesign.com',
  'coworkinginsights.com',
  'allwork.space',
  'wework.co.in',
  'awfis.com',
  'coworker.com',
  'deskmag.com'
);
