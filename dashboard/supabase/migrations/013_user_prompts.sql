-- Add user_id to prompts to allow user-specific templates
-- NULL user_id means it's a global default prompt

ALTER TABLE prompts ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for prompts
DROP POLICY IF EXISTS "Allow all access to prompts" ON prompts;

-- 1. Everyone can read global prompts (user_id IS NULL)
-- 2. Users can read their own prompts (user_id = auth.uid())
CREATE POLICY "Users can view global and owned prompts" 
ON prompts FOR SELECT 
USING (user_id IS NULL OR user_id = auth.uid());

-- 3. Users can only insert prompts for themselves
CREATE POLICY "Users can insert their own prompts" 
ON prompts FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 4. Users can only update their own prompts
CREATE POLICY "Users can update their own prompts" 
ON prompts FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Users can only delete their own prompts
CREATE POLICY "Users can delete their own prompts" 
ON prompts FOR DELETE 
USING (user_id = auth.uid());
