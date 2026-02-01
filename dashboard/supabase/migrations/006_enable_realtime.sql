-- Enable Realtime for the collections table
DO $$
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'collections'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collections;
    END IF;
END $$;
