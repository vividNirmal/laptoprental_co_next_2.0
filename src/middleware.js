import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Add cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/static/') || 
      request.nextUrl.pathname.includes('.') && 
      (request.nextUrl.pathname.endsWith('.js') || 
       request.nextUrl.pathname.endsWith('.css') ||
       request.nextUrl.pathname.endsWith('.png') ||
       request.nextUrl.pathname.endsWith('.jpg') ||
       request.nextUrl.pathname.endsWith('.svg'))) {
    
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add cache headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add compression hint
  response.headers.set('Vary', 'Accept-Encoding');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};