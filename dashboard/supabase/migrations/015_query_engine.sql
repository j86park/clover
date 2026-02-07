-- Migration: 015_query_engine.sql
-- Purpose: Support natural language queries with dynamic SQL execution

-- Create a secure function to execute analytical queries
-- This is restricted to 'authenticated' users and used by the server-side API
CREATE OR REPLACE FUNCTION public.exec_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions to access all tables
SET search_path = public, auth
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check for forbidden keywords to prevent mutations
    IF query_text ~* '(UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)' THEN
        RAISE EXCEPTION 'Query contains forbidden keywords (INSERT, UPDATE, DELETE, etc.)';
    END IF;

    -- Execute and capture as JSON
    EXECUTE 'SELECT jsonb_agg(t) FROM (' || query_text || ') t' INTO result;
    
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL Execution Error: %', SQLERRM;
END;
$$;

-- Revoke all permissions and then grant only to the service_role
-- The API uses the service_role or a privileged server-side client
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;
