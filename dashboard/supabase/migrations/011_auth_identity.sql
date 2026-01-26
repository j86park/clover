-- Migration: 011_auth_identity.sql
-- Description: Add user_id to brands and enable restrictive RLS policies for multi-tenancy

-- 1. Add user_id to brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Create Index for performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);

-- 3. Update existing policies (Drop permissive ones first)
DROP POLICY IF EXISTS "Allow all access to brands" ON public.brands;
DROP POLICY IF EXISTS "Allow all access to competitors" ON public.competitors;
DROP POLICY IF EXISTS "Allow all access to collections" ON public.collections;
DROP POLICY IF EXISTS "Allow all access to responses" ON public.responses;
DROP POLICY IF EXISTS "Allow all access to analysis" ON public.analysis;
DROP POLICY IF EXISTS "Allow all access to metrics" ON public.metrics;

-- 4. Create Restrictive Policies

-- Brands: Users can only see/edit their own brands
CREATE POLICY "Users can manage their own brands"
ON public.brands FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Competitors: Users can manage competitors belonging to their brands
CREATE POLICY "Users can manage their competitors"
ON public.competitors FOR ALL
TO authenticated
USING (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
)
WITH CHECK (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
);

-- Collections: Users can manage collections belonging to their brands
CREATE POLICY "Users can manage their collections"
ON public.collections FOR ALL
TO authenticated
USING (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
)
WITH CHECK (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
);

-- Responses: Users can manage responses belonging to their collections
CREATE POLICY "Users can manage their responses"
ON public.responses FOR ALL
TO authenticated
USING (
  collection_id IN (
    SELECT c.id FROM public.collections c 
    JOIN public.brands b ON c.brand_id = b.id 
    WHERE b.user_id = auth.uid()
  )
)
WITH CHECK (
  collection_id IN (
    SELECT c.id FROM public.collections c 
    JOIN public.brands b ON c.brand_id = b.id 
    WHERE b.user_id = auth.uid()
  )
);

-- Analysis: Users can manage analysis belonging to their responses
CREATE POLICY "Users can manage their analyses"
ON public.analysis FOR ALL
TO authenticated
USING (
  response_id IN (
    SELECT r.id FROM public.responses r
    JOIN public.collections c ON r.collection_id = c.id
    JOIN public.brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  )
)
WITH CHECK (
  response_id IN (
    SELECT r.id FROM public.responses r
    JOIN public.collections c ON r.collection_id = c.id
    JOIN public.brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

-- Metrics: Users can manage metrics belonging to their brands
CREATE POLICY "Users can manage their metrics"
ON public.metrics FOR ALL
TO authenticated
USING (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
)
WITH CHECK (
  brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
);

-- Special case for Prompts: Currently global, but we can make them readable by all authenticated users
DROP POLICY IF EXISTS "Allow all access to prompts" ON public.prompts;
CREATE POLICY "Authenticated users can read prompts"
ON public.prompts FOR SELECT
TO authenticated
USING (true);
