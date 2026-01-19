-- Add unique constraint on user_id and product_id for upsert to work
ALTER TABLE public.user_purchases 
ADD CONSTRAINT user_purchases_user_id_product_id_key 
UNIQUE (user_id, product_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_product 
ON public.user_purchases(user_id, product_id);