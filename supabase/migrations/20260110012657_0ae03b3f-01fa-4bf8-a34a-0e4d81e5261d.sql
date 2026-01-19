-- Create a table to track user purchases/payments
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  product_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own purchases (pending status for checkout initiation)
CREATE POLICY "Users can insert their own purchases"
ON public.user_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX idx_user_purchases_stripe_session ON public.user_purchases(stripe_session_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_purchases_updated_at
BEFORE UPDATE ON public.user_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();