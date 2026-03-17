ALTER TABLE public.scan_history 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision,
ADD COLUMN treatment_costs jsonb;