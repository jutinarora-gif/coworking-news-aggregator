-- =========================================================
-- job_applications
-- =========================================================
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  portfolio_url text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.job_applications TO anon, authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
-- Anyone can apply, but applications contain PII (email/phone) so only the
-- service role can read them back - no public SELECT policy, same as
-- newsletter_subscribers.
CREATE POLICY "Anyone can apply" ON public.job_applications FOR INSERT WITH CHECK (
  name IS NOT NULL AND length(trim(name)) > 0
  AND email IS NOT NULL AND email LIKE '%@%.%'
  AND role IS NOT NULL AND length(trim(role)) > 0
);
CREATE INDEX job_applications_created_idx ON public.job_applications(created_at DESC);
