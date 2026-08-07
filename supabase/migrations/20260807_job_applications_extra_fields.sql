-- =========================================================
-- job_applications: CTC, notice period, resume upload
-- =========================================================
ALTER TABLE public.job_applications
  ADD COLUMN current_ctc text,
  ADD COLUMN expected_ctc text,
  ADD COLUMN notice_period text,
  ADD COLUMN resume_path text;

-- Private bucket: candidates can upload, nobody can list/read back over the
-- public API. Only the service role (used by an admin tool, or the
-- dashboard's Storage browser) can retrieve resumes.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload a resume"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');
