-- Fix: Prevent users from modifying is_paid field (privilege escalation vulnerability)
-- The is_paid field should only be modifiable by admin operations (Stripe webhook with service role key)

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that prevents modification of is_paid
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    is_paid = (SELECT is_paid FROM public.profiles WHERE user_id = auth.uid())
  );