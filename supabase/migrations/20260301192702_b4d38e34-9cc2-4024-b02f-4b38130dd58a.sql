
-- Table to track anonymous rate limits by IP
CREATE TABLE public.anon_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast IP lookups
CREATE UNIQUE INDEX idx_anon_rate_limits_ip ON public.anon_rate_limits (ip_address);

-- Enable RLS (no public policies - only accessed via service role from edge function)
ALTER TABLE public.anon_rate_limits ENABLE ROW LEVEL SECURITY;

-- Cleanup function to remove stale entries older than 24h
CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.anon_rate_limits WHERE window_start < now() - interval '24 hours';
END;
$$;
