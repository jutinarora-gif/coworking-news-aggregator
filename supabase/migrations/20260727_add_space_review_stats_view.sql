-- Precomputed per-space rating aggregate so pages don't have to pull every
-- review row over the wire just to average them client-side.
create or replace view space_review_stats as
select space_id, avg(rating_overall)::numeric(3,2) as avg_rating, count(*) as review_count
from reviews
group by space_id;
