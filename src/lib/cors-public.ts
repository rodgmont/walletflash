/** CORS headers for merchant widget integrations on external domains. */
export function publicLnurlCorsHeaders(): HeadersInit {
  const origin = process.env.CDN_WIDGET_ALLOW_ORIGIN?.trim();
  return {
    'Access-Control-Allow-Origin': origin && origin.length > 0 ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
