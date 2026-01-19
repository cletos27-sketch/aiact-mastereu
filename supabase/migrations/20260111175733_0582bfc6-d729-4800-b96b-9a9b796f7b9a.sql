-- Fix 1: Add DELETE policy to assessment_responses for GDPR compliance
CREATE POLICY "Users can delete their own assessments"
ON public.assessment_responses
FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: Remove UPDATE policy from user_purchases to prevent privilege escalation
-- Users should not be able to modify their own purchase records
-- All purchase updates should come from Stripe webhook (using admin client)
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.user_purchases;