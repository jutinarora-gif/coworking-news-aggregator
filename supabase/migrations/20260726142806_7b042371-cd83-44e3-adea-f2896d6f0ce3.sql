
-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.region_kind AS ENUM ('india', 'global');
CREATE TYPE public.dispatch_source AS ENUM ('rss', 'editorial');
CREATE TYPE public.vote_target AS ENUM ('dispatch', 'review', 'question', 'answer', 'sales_question');
CREATE TYPE public.save_target AS ENUM ('space', 'dispatch');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- profiles (author identity; auth_user_id nullable for seeds)
-- =========================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  city text,
  bio text,
  is_verified_coworker boolean NOT NULL DEFAULT false,
  is_founder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- user_roles + has_role()
-- =========================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =========================================================
-- cities
-- =========================================================
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country text NOT NULL,
  region public.region_kind NOT NULL,
  lat double precision,
  lng double precision,
  tier smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are public" ON public.cities FOR SELECT USING (true);

-- =========================================================
-- spaces
-- =========================================================
CREATE TABLE public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  address text,
  lat double precision,
  lng double precision,
  price_from integer,
  currency text NOT NULL DEFAULT 'INR',
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  vibe_tags text[] NOT NULL DEFAULT '{}',
  cover_url text,
  description text,
  website_url text,
  founder_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spaces TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spaces TO authenticated;
GRANT ALL ON public.spaces TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published spaces are public" ON public.spaces FOR SELECT USING (is_published = true);
CREATE POLICY "Admins/mods can manage spaces" ON public.spaces FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE TRIGGER trg_spaces_updated BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX spaces_city_idx ON public.spaces(city_id);

-- =========================================================
-- feeds
-- =========================================================
CREATE TABLE public.feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL UNIQUE,
  source_site text NOT NULL,
  region public.region_kind NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  approved boolean NOT NULL DEFAULT false,
  last_polled_at timestamptz,
  last_status text,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feeds TO anon, authenticated;
GRANT INSERT ON public.feeds TO authenticated;
GRANT ALL ON public.feeds TO service_role;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved feeds are public" ON public.feeds FOR SELECT USING (approved = true);
CREATE POLICY "Users can suggest a feed" ON public.feeds FOR INSERT WITH CHECK (auth.uid() = added_by);
CREATE POLICY "Admins manage feeds" ON public.feeds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- dispatches
-- =========================================================
CREATE TABLE public.dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  feed_id uuid REFERENCES public.feeds(id) ON DELETE SET NULL,
  source_type public.dispatch_source NOT NULL DEFAULT 'rss',
  guid text,
  title text NOT NULL,
  excerpt text,
  body_md text,
  cover_url text,
  source_url text,
  source_name text,
  region public.region_kind NOT NULL,
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  linked_space_id uuid REFERENCES public.spaces(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  ingested_at timestamptz NOT NULL DEFAULT now(),
  is_hidden boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_id, guid)
);
GRANT SELECT ON public.dispatches TO anon, authenticated;
GRANT ALL ON public.dispatches TO service_role;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible dispatches are public" ON public.dispatches FOR SELECT USING (is_hidden = false);
CREATE POLICY "Admins manage dispatches" ON public.dispatches FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE INDEX dispatches_pub_idx ON public.dispatches(published_at DESC);
CREATE INDEX dispatches_region_idx ON public.dispatches(region);
CREATE INDEX dispatches_space_idx ON public.dispatches(linked_space_id);

-- =========================================================
-- reviews
-- =========================================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_overall numeric(2,1) NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_wifi smallint CHECK (rating_wifi BETWEEN 1 AND 5),
  rating_quiet smallint CHECK (rating_quiet BETWEEN 1 AND 5),
  rating_community smallint CHECK (rating_community BETWEEN 1 AND 5),
  rating_coffee smallint CHECK (rating_coffee BETWEEN 1 AND 5),
  rating_value smallint CHECK (rating_value BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  pros text,
  cons text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible reviews are public" ON public.reviews FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can post their own reviews" ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE INDEX reviews_space_idx ON public.reviews(space_id);
CREATE INDEX reviews_created_idx ON public.reviews(created_at DESC);

-- =========================================================
-- questions + answers
-- =========================================================
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  is_ama boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible questions are public" ON public.questions FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can post their own questions" ON public.questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users manage their own questions" ON public.questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);

CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_founder_reply boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.answers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible answers are public" ON public.answers FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can post their own answers" ON public.answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);

-- =========================================================
-- votes
-- =========================================================
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.vote_target NOT NULL,
  target_id uuid NOT NULL,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, target_type, target_id)
);
GRANT SELECT ON public.votes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.votes TO authenticated;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are public" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.votes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users can update their vote" ON public.votes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users can remove their vote" ON public.votes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);

-- =========================================================
-- sales_questions (curated checklist)
-- =========================================================
CREATE TABLE public.sales_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  text text NOT NULL,
  category text,
  is_global boolean NOT NULL DEFAULT true,
  upvotes_denorm integer NOT NULL DEFAULT 0,
  suggested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sales_questions TO anon, authenticated;
GRANT INSERT ON public.sales_questions TO authenticated;
GRANT ALL ON public.sales_questions TO service_role;
ALTER TABLE public.sales_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved sales questions are public" ON public.sales_questions FOR SELECT USING (approved = true);
CREATE POLICY "Users can suggest sales questions" ON public.sales_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = suggested_by AND p.auth_user_id = auth.uid())
);

-- =========================================================
-- saves (bookmarks)
-- =========================================================
CREATE TABLE public.saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.save_target NOT NULL,
  target_id uuid NOT NULL,
  collection_name text NOT NULL DEFAULT 'Saved',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, target_type, target_id, collection_name)
);
GRANT SELECT, INSERT, DELETE ON public.saves TO authenticated;
GRANT ALL ON public.saves TO service_role;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their saves" ON public.saves FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users create their saves" ON public.saves FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "Users delete their saves" ON public.saves FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())
);

-- =========================================================
-- newsletter_subscribers
-- =========================================================
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- =========================================================
-- space_of_week + weekly_winners
-- =========================================================
CREATE TABLE public.space_of_week (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  editorial_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.space_of_week TO anon, authenticated;
GRANT ALL ON public.space_of_week TO service_role;
ALTER TABLE public.space_of_week ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Space of the week is public" ON public.space_of_week FOR SELECT USING (true);

CREATE TABLE public.weekly_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  rank smallint NOT NULL,
  score numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, space_id)
);
GRANT SELECT ON public.weekly_winners TO anon, authenticated;
GRANT ALL ON public.weekly_winners TO service_role;
ALTER TABLE public.weekly_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weekly winners are public" ON public.weekly_winners FOR SELECT USING (true);
CREATE INDEX weekly_winners_week_idx ON public.weekly_winners(week_start DESC, rank);
