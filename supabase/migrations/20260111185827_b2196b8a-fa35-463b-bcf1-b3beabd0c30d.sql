-- Habilitar REALTIME para profiles (user_purchases já está)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Garantir REPLICA IDENTITY FULL para realtime funcionar corretamente
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_purchases REPLICA IDENTITY FULL;