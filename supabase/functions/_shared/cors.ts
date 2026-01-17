export const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://aiact-master.eu",           // Seu domínio oficial
    "https://aiact-mastereu.lovable.app", // O domínio do Lovable
    "http://localhost:3000",
    "http://localhost:5173"
  ];

  // Se a origem da requisição estiver na lista, usamos ela. 
  // Se não, usamos a primeira da lista por padrão.
  const headerOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": headerOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

export const handleCorsPreflightRequest = (req: Request) => {
  const origin = req.headers.get("origin");
  return new Response("ok", { 
    status: 200, 
    headers: getCorsHeaders(origin) 
  });
};