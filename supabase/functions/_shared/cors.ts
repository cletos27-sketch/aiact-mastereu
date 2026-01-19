import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Define os domínios permitidos. Em produção, você deve ter apenas o seu domínio.
// Para desenvolvimento, adicionamos localhost.
const ALLOWED_ORIGINS = [
  "https://aiact-master.eu",
  "http://localhost:3000", // Exemplo de porta comum para desenvolvimento React
  "http://localhost:32101", // A porta que você está usando atualmente
  "http://localhost:5173", // Outra porta comum para Vite
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    // Fallback para um domínio padrão se o origin não for permitido
    // Em produção, você pode querer remover este fallback ou torná-lo mais restritivo
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGINS[0]; // Usa o primeiro domínio permitido como padrão
  }

  return headers;
}

export function handleCorsPreflightRequest(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}