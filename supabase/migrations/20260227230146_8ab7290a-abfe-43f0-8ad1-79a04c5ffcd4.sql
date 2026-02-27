
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS image_analyses_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_analyses_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_reset_at timestamp with time zone NOT NULL DEFAULT now();
