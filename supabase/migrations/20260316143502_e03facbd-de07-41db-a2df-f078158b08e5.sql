-- Create scan history table
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  crop TEXT,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  disease_name TEXT,
  confidence TEXT,
  severity TEXT,
  description TEXT,
  treatment TEXT[],
  prevention TEXT[]
);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert scans (no auth for MVP)
CREATE POLICY "Anyone can view scans" ON public.scan_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scans" ON public.scan_history FOR INSERT WITH CHECK (true);