// Shared CORS configuration for edge functions
// Restricts Access-Control-Allow-Origin to known origins for security

// Allowed origins whitelist
const ALLOWED_ORIGINS = [
  "https://aiact-mastereu.lovable.app", // Seu domínio de produção
  "https://dysoidrqyndwvadiwcrq.lovable.app", // Manter para ambiente de preview/staging se ainda em uso
  "https://lovable.dev",
  // "http://localhost:5173", // Remover em produção
  // "http://localhost:8080", // Remover em produção
  // "http://localhost:3000", // Remover em produção
  // TODO: Adicione aqui o seu novo domínio de produção (ex: "https://seunovoapp.com")
];

// Pattern to match Lovable project preview URLs
const LOVABLE_PREVIEW_PATTERN = /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/;

/**
 * Get CORS headers with origin validation
 * Only allows requests from whitelisted origins
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  
  // Check if origin is in allowed list OR matches Lovable preview pattern
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || LOVABLE_PREVIEW_PATTERN.test(origin);
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0]; // Fallback para o primeiro da lista se não permitido
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response {
  return new Response(null, { 
    headers: getCorsHeaders(req),
    status: 204 
  });
}