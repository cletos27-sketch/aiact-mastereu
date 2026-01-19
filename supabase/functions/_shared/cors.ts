export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Esta é a função que o seu index.ts está chamando
export const getCorsHeaders = () => corsHeaders;

// Esta é a função que lida com o "Preflight" (o OPTIONS que está falhando)
export const handleOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
};