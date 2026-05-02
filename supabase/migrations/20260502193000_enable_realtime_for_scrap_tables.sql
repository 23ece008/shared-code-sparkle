ALTER TABLE public.materials REPLICA IDENTITY FULL;
ALTER TABLE public.collectors REPLICA IDENTITY FULL;
ALTER TABLE public.pickups REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'materials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'collectors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collectors;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'pickups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pickups;
  END IF;
END $$;
