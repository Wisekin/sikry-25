import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { searchRateLimitMiddleware } from "./middleware/searchRateLimit";
import { apiRateLimiter, authRateLimiter, scraperRateLimiter } from "./lib/security/rateLimiter";

// Define auth-related page routes (not API)
const authPageRoutes = [
  '/login',
  '/signup',
  '/forgot-password'
];

// Define marketing/public pages
const publicRoutes = [
  '/',
  '/features',
  '/pricing',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
  '/security'
];

// Define static and system routes that should always be accessible
const systemRoutes = [
  '/_next',
  '/favicon.ico',
  '/placeholder.svg',
  '/.well-known',
  '/fonts',
  '/images',
  '/static'
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/search',
  '/dashboard',
  '/admin',
  '/settings',
  '/profile',
  '/my-account',
  '/(dashboard)' // Group route
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // API Route Rate Limiting
  if (pathname.startsWith('/api/')) {
    let limiterResponse;
    if (pathname.startsWith('/api/auth')) { // Assuming /api/auth/login, /api/auth/signup etc.
      limiterResponse = await authRateLimiter.isAllowed(request);
    } else if (pathname.startsWith('/api/scrapers') || pathname.startsWith('/api/search/scraper')) {
      limiterResponse = await scraperRateLimiter.isAllowed(request);
    } else if (pathname.startsWith('/api/search')) {
      // DbRateLimiter is handled by searchRateLimitMiddleware
      const searchRlResponse = await searchRateLimitMiddleware(request);
      if (searchRlResponse.status === 429 || searchRlResponse.status === 401) {
        return searchRlResponse;
      }
      // If searchRlResponse is not a rate limit error, it might be NextResponse.next() or a warning.
      // We let it pass through, or if it's a simple NextResponse.next(), it will be the `response` variable.
      if (searchRlResponse.headers.has("X-Rate-Limit-Warning") || searchRlResponse.headers.get("content-type")?.includes("application/json")) {
         // if it's a json response (error or actual data from a GET in middleware) or has a warning, return it
        if(searchRlResponse.status !== 200 && !searchRlResponse.headers.has("X-Rate-Limit-Warning")) return searchRlResponse;
        // if it was a warning, let's update the response object to carry headers from searchRlResponse
        searchRlResponse.headers.forEach((v, k) => response.headers.set(k, v));
      }
      // Continue to Supabase client and session logic if not blocked by search rate limiter
    } else if (pathname.startsWith('/api/docs')) {
      // No rate limiting for API docs
    }
    else {
      limiterResponse = await apiRateLimiter.isAllowed(request);
    }

    if (limiterResponse && !limiterResponse.allowed) {
      return NextResponse.json(
        { message: "Too many requests", remaining: limiterResponse.remaining, reset: new Date(limiterResponse.resetTime) },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': limiterResponse.remaining.toString(),
            'X-RateLimit-Reset': new Date(limiterResponse.resetTime).toISOString(),
          },
        }
      );
    }
    // If rate limited by in-memory limiters, the response is returned.
    // Otherwise, for /api routes, we continue to Supabase client init and session handling.
    // This is important if API routes need auth.
  }


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await request.cookies; // In middleware, use request.cookies directly
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          // In middleware, you need to set the cookie on the request and the response.
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          // In middleware, you need to delete the cookie on the request and the response.
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // IMPORTANT: Avoid calling getSession() too early if you don't need it for all routes.
  // Refresh session if expired - crucial for Server Components and API routes.
  // This will update the cookies if the session is refreshed.
  const { data: { session } } = await supabase.auth.getSession();

  // const { pathname } = request.nextUrl; // pathname is already defined above

  // Check route types for page routes (non-API)
  const isAuthPageRoute = authPageRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isSystemRoute = systemRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) || pathname === route); // Ensure exact match for /(dashboard)

  // Allow system routes and static assets unconditionally
  if (isSystemRoute || pathname.includes('.')) { 
    // console.log('Middleware: Allowing access to system/static route:', pathname);
    return response; // Use the potentially modified response from Supabase client
  }

  // If user is logged in and tries to access auth page routes, redirect to dashboard
  if (session && isAuthPageRoute && !pathname.startsWith('/api')) {
    // console.log('Middleware: Session found, redirecting from auth page route to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and tries to access a protected page route, redirect to login
  if (!session && isProtectedRoute && !pathname.startsWith('/api')) {
    // console.log('Middleware: No session, protected page route, redirecting to login for:', pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow public routes or if a session exists for other routes (like dashboard already handled)
  if (isPublicRoute || session) {
    // console.log('Middleware: Allowing access to public route or session exists:', pathname);
    return response; // Use the potentially modified response
  }

  // Fallback: if no session and not a public/auth route, redirect to login (should be rare if logic is exhaustive)
  // console.log('Middleware: Fallback, no session, not public/auth, redirecting to login for:', pathname);
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files and specific Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
