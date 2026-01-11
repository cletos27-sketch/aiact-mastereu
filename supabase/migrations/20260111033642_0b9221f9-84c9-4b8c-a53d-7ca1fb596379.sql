-- Add UPDATE policy for user_purchases table to complete RLS model
CREATE POLICY "Users can update their own purchases"
ON public.user_purchases
FOR UPDATE
USING (auth.uid() = user_id);