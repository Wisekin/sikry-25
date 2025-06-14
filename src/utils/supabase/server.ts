import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // The createServerClient function itself is synchronous.
  // The cookie handling methods provided to it will be async.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => { // Method is async
          try {
            const cookieStore = await cookies() // Await cookies()
            return cookieStore.get(name)?.value
          } catch (error) {
            // console.error(`Cookie get error (server.ts): ${name}`, error);
            return undefined
          }
        },
        set: async (name: string, value: string, options: CookieOptions) => { // Method is async
          try {
            const cookieStore = await cookies() // Await cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove: async (name: string, options: CookieOptions) => { // Method is async
          try {
            const cookieStore = await cookies() // Await cookies()
            cookieStore.set(name, '', options) // To remove, set to empty with options
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}