-- Enable realtime for user_purchases table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_purchases;

-- Ensure service_role can bypass RLS (already default, but explicit)
-- Add policy to allow service_role to manage all purchases
DO $$
BEGIN
  -- Drop existing service role policies if they exist
  DROP POLICY IF EXISTS "Service role can manage all purchases" ON public.user_purchases;
  
  -- Create new policy for service role operations
  CREATE POLICY "Service role can manage all purchases"
    ON public.user_purchases
    FOR ALL
    USING (true)
    WITH CHECK (true);
END $$;

-- Note: The service_role key automatically bypasses RLS, but this policy
-- ensures that operations work correctly even with the anon key in edge cases