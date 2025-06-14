import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { DbRateLimiter } from "@/src/utils/cache/rateLimiter"

export async function searchRateLimitMiddleware(req: NextRequest) {
  const rateLimiter = new DbRateLimiter()
  if (req.nextUrl.pathname.startsWith("/api/search")) {
    const result = await rateLimiter.isAllowed(req)
    
    if (!result.allowed || result.status !== 200) {
      // For 401 Unauthorized, redirect to login
      if (result.status === 401) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('returnTo', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // For rate limit exceeded
      if (result.status === 429) {
        return NextResponse.json(
          {
            success: false,
            message: result.message || "Rate limit exceeded",
            errors: [
              {
                code: "RATE_LIMIT_EXCEEDED",
                message: result.message || `Rate limit exceeded. Please try again later.`,
              },
            ],
          },
          { 
            status: result.status,
            headers: {
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            }
          }
        )
      }

      // For other errors
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Search request failed",
          errors: [
            {
              code: "SEARCH_ERROR",
              message: result.message || "An error occurred processing your search request",
            },
          ],
        },
        { status: result.status }
      )
    }

    // If within burst limit, add warning header
    if (result.message) {
      const response = NextResponse.next()
      response.headers.set("X-Rate-Limit-Warning", result.message)
      return response
    }
  }

  // Clean up expired rate limits periodically (1% chance)
  if (Math.random() < 0.01) {
    await rateLimiter.cleanup()
  }

  return NextResponse.next()
}
