import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { searchRateLimitMiddleware } from "./middleware/searchRateLimit";

// Define auth-related routes
const authRoutes = [
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

  // Apply search rate limiting first for /api/search routes
  if (request.nextUrl.pathname.startsWith('/api/search')) {
    const rateLimitResponse = await searchRateLimitMiddleware(request);
    if (rateLimitResponse.status === 429 || rateLimitResponse.status === 401) {
      return rateLimitResponse;
    } // Allow other responses from searchRateLimitMiddleware to pass through or be handled by main logic
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

  const { pathname } = request.nextUrl;

  // Check route types
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isSystemRoute = systemRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) || pathname === route); // Ensure exact match for /(dashboard)

  // Allow system routes and static assets unconditionally
  if (isSystemRoute || pathname.includes('.')) { 
    // console.log('Middleware: Allowing access to system/static route:', pathname);
    return response; // Use the potentially modified response from Supabase client
  }

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (session && isAuthRoute) {
    // console.log('Middleware: Session found, redirecting from auth route to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!session && isProtectedRoute) {
    // console.log('Middleware: No session, protected route, redirecting to login for:', pathname);
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
    // Match all paths except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
