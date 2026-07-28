-- Lets a signed-in user submit a new coworking space for review. It lands as
-- an unpublished row (is_published = false) that only the submitter and
-- admins/moderators can see; approving it is just flipping is_published to
-- true, which the existing "Published spaces are public" policy already
-- exposes automatically, so there is no separate "listing" step.
alter table public.spaces add column if not exists submitted_by uuid references auth.users(id) on delete set null;

create policy "Users can submit their own pending space"
  on public.spaces for insert
  to authenticated
  with check (submitted_by = auth.uid() and is_published = false);

create policy "Users can view their own submissions"
  on public.spaces for select
  to authenticated
  using (submitted_by = auth.uid());
