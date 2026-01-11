// Shared CORS configuration for edge functions
// Restricts Access-Control-Allow-Origin to known origins for security

// Allowed origins whitelist
const ALLOWED_ORIGINS = [
  "https://dysoidrqyndwvadiwcrq.lovable.app",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

/**
 * Get CORS headers with origin validation
 * Only allows requests from whitelisted origins
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  
  // Check if origin is in allowed list
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Default to primary production URL
  
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
