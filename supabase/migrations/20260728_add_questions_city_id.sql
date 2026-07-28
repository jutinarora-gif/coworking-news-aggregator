-- Lets city-only questions (space_id null, e.g. "Best quiet space in Bangalore?")
-- still be filterable by city on the Q&A page, alongside space-specific ones.
alter table questions add column if not exists city_id uuid references cities(id);

-- Backfill existing space-specific questions from their space's city.
update questions q
set city_id = s.city_id
from spaces s
where q.space_id = s.id and q.city_id is null;
