-- Remove the overly permissive policy - service_role already bypasses RLS
DROP POLICY IF EXISTS "Service role can manage all purchases" ON public.user_purchases;